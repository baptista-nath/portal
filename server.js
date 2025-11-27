const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const db = require('./src/database');
const adminRoutes = require('./src/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Pasta onde as imagens serão salvas
  },
  filename: function (req, file, cb) {
    // Gera um nome único: timestamp + nome original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

// Exportar upload para uso nas rotas
app.locals.upload = upload;

// ============================================
// CONFIGURAÇÃO DO SQLITE
// ============================================
// Conecta ao arquivo de banco de dados SQLite: noticias.db
// O arquivo será criado automaticamente se não existir
const dbPath = path.join(__dirname, 'noticias.db');
const database = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite');
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
    const params = [titulo, subtitulo || '', conteudo, imagem_url || '', video_url || '', autor];
    
    // Executar inserção no banco
    database.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Erro ao inserir notícia:', err.message);
        reject(err);
      } else {
        // this.lastID contém o ID da linha recém-inserida
        console.log(`✅ Notícia inserida com sucesso! ID: ${this.lastID}`);
        resolve({
          id: this.lastID,
          message: 'Notícia criada com sucesso',
          titulo: titulo
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
        console.error('❌ Erro ao listar notícias:', err.message);
        reject(err);
      } else {
        console.log(`✅ ${rows.length} notícias recuperadas do banco de dados`);
        resolve(rows);
      }
    });
  });
}

// Exportar funções para uso nas rotas
app.locals.inserirNoticia = inserirNoticia;
app.locals.listarNoticias = listarNoticias;

// Configurar EJS como template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Rotas principais
// Rota Home - Serve o HTML estático com layout de jornal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota Home Dinâmica (EJS) - Lista notícias do banco de dados
app.get('/noticias', async (req, res) => {
  try {
    const noticias = await listarNoticias(20); // Busca as últimas 20 notícias
    res.render('index', { noticias }); // Renderiza template EJS com as notícias
  } catch (error) {
    console.error('Erro ao carregar página de notícias:', error);
    res.status(500).send('Erro ao carregar página');
  }
});

// Static files para uploads, css e js
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// API para listar notícias (para o front-end)
app.get('/api/noticias', async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const noticias = await db.getLatestNoticias(limit);
    res.json(noticias);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar notícias' });
  }
});

// API para buscar notícia por ID
app.get('/api/noticias/:id', async (req, res) => {
  try {
    const noticia = await db.getNoticiaById(req.params.id);
    if (noticia) {
      res.json(noticia);
    } else {
      res.status(404).json({ error: 'Notícia não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar notícia' });
  }
});

// Rota POST para criar notícia (alternativa usando inserirNoticia)
app.post('/api/noticias/criar', async (req, res) => {
  try {
    const { titulo, subtitulo, conteudo, imagem_url, video_url, autor } = req.body;
    
    // Validação básica
    if (!titulo || !conteudo || !autor) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando: titulo, conteudo e autor são necessários' 
      });
    }
    
    // Inserir usando a função inserirNoticia
    const resultado = await inserirNoticia({
      titulo,
      subtitulo,
      conteudo,
      imagem_url,
      video_url,
      autor
    });
    
    res.status(201).json(resultado);
  } catch (error) {
    console.error('Erro ao criar notícia:', error);
    res.status(500).json({ error: 'Erro ao criar notícia' });
  }
});

// Rotas administrativas
app.use('/admin', adminRoutes);

// Inicializar banco de dados e servidor
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Painel Admin: http://localhost:${PORT}/admin/noticias`);
  });
}).catch(err => {
  console.error('Erro ao inicializar banco de dados:', err);
});
