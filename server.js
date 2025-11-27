const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const session = require("express-session");
const bcrypt = require("bcrypt");
const db = require("./src/database");
const adminRoutes = require("./src/admin");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Pasta onde as imagens serão salvas
  },
  filename: function (req, file, cb) {
    // Gera um nome único: timestamp + nome original
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Apenas imagens são permitidas!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

// Exportar upload para uso nas rotas
app.locals.upload = upload;

// ============================================
// CONFIGURAÇÃO DO SQLITE
// ============================================
// Conecta ao arquivo de banco de dados SQLite: jornal_maraba.sqlite
// O arquivo será criado automaticamente se não existir
const dbPath = path.join(__dirname, "jornal_maraba.sqlite");
const database = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("✅ Conectado ao banco de dados SQLite (jornal_maraba.sqlite)");
  }
});

// ============================================
// FUNÇÃO: inserirNoticia(dados)
// ============================================
/**
 * Insere uma nova notícia no banco de dados SQLite
 * Esta função é utilizada pela rota POST /admin/noticias/nova
 *
 * ESTRUTURA DA TABELA:
 * CREATE TABLE IF NOT EXISTS noticias (
 *   id INTEGER PRIMARY KEY AUTOINCREMENT,
 *   titulo TEXT NOT NULL,
 *   subtitulo TEXT,
 *   conteudo TEXT NOT NULL,
 *   imagem_url TEXT,
 *   video_url TEXT,
 *   data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
 *   autor TEXT NOT NULL
 * )
 *
 * @param {Object} dados - Objeto contendo os dados da notícia
 * @param {string} dados.titulo - Título da notícia (obrigatório)
 * @param {string} dados.subtitulo - Subtítulo (opcional)
 * @param {string} dados.conteudo - Texto completo da notícia (obrigatório)
 * @param {string} dados.imagem_url - URL ou caminho da imagem (opcional)
 * @param {string} dados.video_url - URL do vídeo (opcional)
 * @param {string} dados.autor - Nome do autor (obrigatório)
 *
 * @returns {Promise<Object>} Retorna objeto com: { id, message, titulo }
 *
 * FLUXO DE USO:
 * 1. Usuário acessa /admin/noticias/nova (formulário)
 * 2. Preenche o formulário e clica em "Salvar"
 * 3. POST /admin/noticias/nova recebe os dados (req.body)
 * 4. A rota chama db.createNoticia() que é similar a inserirNoticia()
 * 5. Dados são inseridos usando prepared statements (segurança SQL)
 * 6. Usuário é redirecionado para /admin/noticias (lista)
 *
 * SEGURANÇA:
 * - Usa prepared statements (?) para prevenir SQL Injection
 * - Valida campos obrigatórios antes de inserir
 */
function inserirNoticia(dados) {
  return new Promise((resolve, reject) => {
    const { titulo, subtitulo, conteudo, imagem_url, video_url, autor } = dados;

    // SQL com placeholders (?) - Prepared Statement
    const sql = `INSERT INTO noticias (titulo, subtitulo, conteudo, imagem_url, video_url, autor, data_publicacao)
                 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`;

    // Parâmetros que substituem os placeholders (na ordem)
    const params = [
      titulo,
      subtitulo || "",
      conteudo,
      imagem_url || "",
      video_url || "",
      autor,
    ];

    // Executar inserção no banco
    database.run(sql, params, function (err) {
      if (err) {
        console.error("❌ Erro ao inserir notícia:", err.message);
        reject(err);
      } else {
        // this.lastID contém o ID da linha recém-inserida
        console.log(`✅ Notícia inserida com sucesso! ID: ${this.lastID}`);
        resolve({
          id: this.lastID,
          message: "Notícia criada com sucesso",
          titulo: titulo,
        });
      }
    });
  });
}

// ============================================
// FUNÇÃO: listarNoticias(limite)
// ============================================
/**
 * Lista as notícias mais recentes do banco de dados
 *
 * @param {number} limite - Número máximo de notícias a retornar (padrão: 6)
 * @returns {Promise<Array>} Array de objetos notícia
 *
 * ESTRUTURA DO OBJETO NOTÍCIA RETORNADO:
 * {
 *   id: 1,
 *   titulo: "Título da notícia",
 *   subtitulo: "Subtítulo",
 *   conteudo: "Texto completo...",
 *   imagem_url: "/uploads/imagem.jpg",
 *   video_url: "https://youtube.com/...",
 *   data_publicacao: "2025-11-27 10:30:00",
 *   autor: "Nome do Autor"
 * }
 *
 * USO NAS ROTAS:
 * - GET / : Lista 6 notícias para a página inicial
 * - GET /noticias : Lista 20 notícias
 * - GET /api/noticias : API que retorna N notícias (JSON)
 */
function listarNoticias(limite = 6) {
  return new Promise((resolve, reject) => {
    // SQL: Busca notícias ordenadas da mais recente para a mais antiga
    const sql = `SELECT * FROM noticias ORDER BY data_publicacao DESC LIMIT ?`;

    database.all(sql, [limite], (err, rows) => {
      if (err) {
        console.error("❌ Erro ao listar notícias:", err.message);
        reject(err);
      } else {
        console.log(`✅ ${rows.length} notícias recuperadas do banco de dados`);
        resolve(rows);
      }
    });
  });
}

// ============================================
// FUNÇÃO: buscarNoticiaPorId(id)
// ============================================
/**
 * Busca uma notícia específica pelo ID
 * 
 * @param {number} id - ID da notícia
 * @returns {Promise<Object|null>} Objeto da notícia ou null se não encontrado
 */
function buscarNoticiaPorId(id) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM noticias WHERE id = ?`;
    
    database.get(sql, [id], (err, row) => {
      if (err) {
        console.error(`❌ Erro ao buscar notícia ID ${id}:`, err.message);
        reject(err);
      } else {
        if (row) {
          console.log(`✅ Notícia ID ${id} encontrada: "${row.titulo}"`);
        } else {
          console.log(`⚠️  Notícia ID ${id} não encontrada`);
        }
        resolve(row);
      }
    });
  });
}

// ============================================
// FUNÇÃO: atualizarNoticia(id, dados)
// ============================================
/**
 * Atualiza uma notícia existente no banco de dados
 * 
 * @param {number} id - ID da notícia a ser atualizada
 * @param {Object} dados - Dados atualizados da notícia
 * @returns {Promise<Object>} Retorna { changes } com número de linhas afetadas
 */
function atualizarNoticia(id, dados) {
  return new Promise((resolve, reject) => {
    const { titulo, subtitulo, conteudo, imagem_url, video_url, autor } = dados;
    
    const sql = `UPDATE noticias 
                 SET titulo = ?, subtitulo = ?, conteudo = ?, 
                     imagem_url = ?, video_url = ?, autor = ?
                 WHERE id = ?`;
    
    const params = [
      titulo,
      subtitulo || "",
      conteudo,
      imagem_url || "",
      video_url || "",
      autor,
      id
    ];
    
    database.run(sql, params, function (err) {
      if (err) {
        console.error(`❌ Erro ao atualizar notícia ID ${id}:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Notícia ID ${id} atualizada. Linhas afetadas: ${this.changes}`);
        resolve({
          changes: this.changes,
          message: "Notícia atualizada com sucesso"
        });
      }
    });
  });
}

// ============================================
// FUNÇÃO: excluirNoticia(id)
// ============================================
/**
 * Exclui uma notícia do banco de dados
 * 
 * @param {number} id - ID da notícia a ser excluída
 * @returns {Promise<Object>} Retorna { changes } com número de linhas afetadas
 */
function excluirNoticia(id) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM noticias WHERE id = ?`;
    
    database.run(sql, [id], function (err) {
      if (err) {
        console.error(`❌ Erro ao excluir notícia ID ${id}:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Notícia ID ${id} excluída. Linhas afetadas: ${this.changes}`);
        resolve({
          changes: this.changes,
          message: "Notícia excluída com sucesso"
        });
      }
    });
  });
}

// Exportar funções para uso nas rotas
app.locals.inserirNoticia = inserirNoticia;
app.locals.listarNoticias = listarNoticias;
app.locals.buscarNoticiaPorId = buscarNoticiaPorId;
app.locals.atualizarNoticia = atualizarNoticia;
app.locals.excluirNoticia = excluirNoticia;

// Configurar EJS como template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ============================================
// CONFIGURAÇÃO DE SESSÃO (EXPRESS-SESSION)
// ============================================
app.use(session({
  secret: 'portal-noticias-secret-key-2025', // Chave secreta forte
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 horas
    httpOnly: true,
    secure: false // Mude para true em produção com HTTPS
  }
}));

// ============================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================
function checkAuth(req, res, next) {
  if (req.session && req.session.user_id) {
    // Usuário está autenticado
    return next();
  } else {
    // Usuário não autenticado, redirecionar para login
    console.log('⛔ Acesso negado - Redirecionando para login');
    return res.redirect('/login');
  }
}

// Rotas principais
// Rota Home - Renderiza template EJS com notícias do banco de dados
app.get("/", async (req, res) => {
  try {
    console.log('\n🏠 === CARREGANDO PÁGINA PRINCIPAL ===');
    const noticias = await listarNoticias(20); // Busca as últimas 20 notícias
    console.log(`📊 Total de notícias carregadas: ${noticias.length}`);
    
    if (noticias.length > 0) {
      console.log(`📰 Primeira notícia: "${noticias[0].titulo}"`);
    } else {
      console.log('⚠️  Nenhuma notícia encontrada no banco de dados');
    }
    
    res.render("index", { noticias }); // Renderiza template EJS com as notícias
    console.log('✅ Página principal renderizada com sucesso');
  } catch (error) {
    console.error("❌ Erro ao carregar página principal:", error);
    res.status(500).send("Erro ao carregar página. Tente novamente.");
  }
});

// Rota alternativa para HTML estático (se necessário)
app.get("/estatico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Static files para uploads, css e js
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));

// API para listar notícias (para o front-end)
app.get("/api/noticias", async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const noticias = await db.getLatestNoticias(limit);
    res.json(noticias);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar notícias" });
  }
});

// API para buscar notícia por ID
app.get("/api/noticias/:id", async (req, res) => {
  try {
    const noticia = await db.getNoticiaById(req.params.id);
    if (noticia) {
      res.json(noticia);
    } else {
      res.status(404).json({ error: "Notícia não encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar notícia" });
  }
});

// Rota POST para criar notícia (alternativa usando inserirNoticia)
app.post("/api/noticias/criar", async (req, res) => {
  try {
    const { titulo, subtitulo, conteudo, imagem_url, video_url, autor } =
      req.body;

    // Validação básica
    if (!titulo || !conteudo || !autor) {
      return res.status(400).json({
        error:
          "Campos obrigatórios faltando: titulo, conteudo e autor são necessários",
      });
    }

    // Inserir usando a função inserirNoticia
    const resultado = await inserirNoticia({
      titulo,
      subtitulo,
      conteudo,
      imagem_url,
      video_url,
      autor,
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error("Erro ao criar notícia:", error);
    res.status(500).json({ error: "Erro ao criar notícia" });
  }
});

// ============================================
// ROTAS DE AUTENTICAÇÃO
// ============================================

// Rota GET /login - Exibe formulário de login
app.get("/login", (req, res) => {
  if (req.session && req.session.user_id) {
    // Se já está logado, redireciona para admin
    return res.redirect('/admin/noticias');
  }
  res.render("login", { erro: null });
});

// Rota POST /login - Processa login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('\n🔐 === TENTATIVA DE LOGIN ===');
    console.log(`👤 Username: ${username}`);
    
    // Validação básica
    if (!username || !password) {
      console.log('❌ Campos vazios');
      return res.render("login", { erro: "Preencha usuário e senha" });
    }
    
    // Buscar usuário no banco
    const sql = `SELECT * FROM usuarios WHERE username = ?`;
    database.get(sql, [username], async (err, user) => {
      if (err) {
        console.error('❌ Erro ao buscar usuário:', err);
        return res.render("login", { erro: "Erro ao fazer login" });
      }
      
      if (!user) {
        console.log('❌ Usuário não encontrado');
        return res.render("login", { erro: "Usuário ou senha inválidos" });
      }
      
      // Verificar senha com bcrypt
      const senhaCorreta = await bcrypt.compare(password, user.password);
      
      if (!senhaCorreta) {
        console.log('❌ Senha incorreta');
        return res.render("login", { erro: "Usuário ou senha inválidos" });
      }
      
      // Login bem-sucedido
      req.session.user_id = user.id;
      req.session.username = user.username;
      
      console.log(`✅ Login bem-sucedido! User ID: ${user.id}`);
      console.log('='.repeat(50));
      
      res.redirect('/admin/noticias');
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.render("login", { erro: "Erro ao fazer login" });
  }
});

// Rota GET /logout - Destrói sessão
app.get("/logout", (req, res) => {
  console.log('\n👋 === LOGOUT ===');
  console.log(`User ID: ${req.session.user_id}`);
  
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Erro ao fazer logout:', err);
    } else {
      console.log('✅ Logout realizado com sucesso');
    }
    res.redirect('/login');
  });
});

// Rota /admin/setup-user - Criar primeiro usuário admin
app.get("/admin/setup-user", async (req, res) => {
  try {
    // Verificar se já existe algum usuário
    const checkSql = `SELECT COUNT(*) as count FROM usuarios`;
    database.get(checkSql, async (err, result) => {
      if (err) {
        return res.status(500).send("Erro ao verificar usuários");
      }
      
      if (result.count > 0) {
        return res.send("❌ Já existe um usuário cadastrado. Use /login para acessar.");
      }
      
      // Criar usuário admin padrão
      const username = "admin";
      const password = "admin123"; // ALTERAR EM PRODUÇÃO!
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const insertSql = `INSERT INTO usuarios (username, password) VALUES (?, ?)`;
      database.run(insertSql, [username, hashedPassword], function(err) {
        if (err) {
          console.error('❌ Erro ao criar usuário:', err);
          return res.status(500).send("Erro ao criar usuário");
        }
        
        console.log('\n✅ === USUÁRIO ADMIN CRIADO ===');
        console.log(`👤 Username: ${username}`);
        console.log(`🔑 Password: ${password}`);
        console.log(`🆔 ID: ${this.lastID}`);
        console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
        console.log('='.repeat(50));
        
        res.send(`
          <h1>✅ Usuário Admin Criado!</h1>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>IMPORTANTE:</strong> Altere a senha após o primeiro login!</p>
          <a href="/login">Fazer Login</a>
        `);
      });
    });
  } catch (error) {
    console.error('❌ Erro no setup:', error);
    res.status(500).send("Erro ao criar usuário");
  }
});

// Rotas administrativas (PROTEGIDAS COM AUTENTICAÇÃO)
app.use("/admin", checkAuth, adminRoutes);

// Inicializar banco de dados e servidor
db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📊 Painel Admin: http://localhost:${PORT}/admin/noticias`);
    });
  })
  .catch((err) => {
    console.error("Erro ao inicializar banco de dados:", err);
  });
