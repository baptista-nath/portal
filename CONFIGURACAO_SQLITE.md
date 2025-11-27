# 📝 Configuração SQLite e Função inserirNoticia

## ✅ Alterações Realizadas no server.js

### 1. Configuração Direta do SQLite

Adicionado no início do `server.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();

// Configuração do SQLite
const dbPath = path.join(__dirname, 'noticias.db');
const database = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite');
  }
});
```

**O que faz:**
- Importa o módulo `sqlite3`
- Define o caminho do arquivo do banco de dados (`noticias.db`)
- Estabelece conexão com o banco SQLite
- Exibe mensagem de confirmação ou erro

---

### 2. Função inserirNoticia(dados)

```javascript
function inserirNoticia(dados) {
  return new Promise((resolve, reject) => {
    const { titulo, subtitulo, conteudo, imagem_url, video_url, autor } = dados;
    
    const sql = `INSERT INTO noticias (titulo, subtitulo, conteudo, imagem_url, video_url, autor, data_publicacao)
                 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`;
    
    const params = [titulo, subtitulo || '', conteudo, imagem_url || '', video_url || '', autor];
    
    database.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Erro ao inserir notícia:', err.message);
        reject(err);
      } else {
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
```

**O que faz:**
- Recebe um objeto `dados` com os campos da notícia
- Cria um SQL INSERT com prepared statements (proteção contra SQL Injection)
- Usa `?` como placeholders para os valores
- Retorna uma Promise que resolve com o ID da notícia criada
- A data de publicação é gerada automaticamente com `datetime('now')`

**Campos:**
- `titulo` - Obrigatório
- `subtitulo` - Opcional (usa '' se vazio)
- `conteudo` - Obrigatório
- `imagem_url` - Opcional (usa '' se vazio)
- `video_url` - Opcional (usa '' se vazio)
- `autor` - Obrigatório
- `data_publicacao` - Automático (timestamp atual)

---

### 3. Rota POST /api/noticias/criar

Adicionada nova rota API que usa a função `inserirNoticia`:

```javascript
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
```

**Como usar:**
```bash
curl -X POST http://localhost:3001/api/noticias/criar \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Título da Notícia",
    "subtitulo": "Subtítulo opcional",
    "conteudo": "Conteúdo completo da notícia",
    "imagem_url": "https://exemplo.com/imagem.jpg",
    "video_url": "https://youtube.com/watch?v=...",
    "autor": "Nome do Autor"
  }'
```

---

### 4. Integração com /admin/noticias/nova

A rota POST `/admin/noticias/nova` já estava funcionando usando `db.createNoticia()`, que internamente faz a mesma coisa que `inserirNoticia()`.

**Arquivo:** `src/admin.js`

```javascript
router.post('/noticias/nova', async (req, res) => {
  // ... validação ...
  
  // Inserir notícia no banco de dados SQLite
  const resultado = await db.createNoticia({
    titulo,
    subtitulo: subtitulo || '',
    conteudo,
    imagem_url: imagem_url || '',
    video_url: video_url || '',
    autor
  });
  
  console.log(`✅ Notícia criada com ID: ${resultado.id}`);
  res.redirect('/admin/noticias?sucesso=true');
});
```

---

## 🔄 Fluxo Completo

### Quando o formulário é submetido:

1. **Usuário preenche** o formulário em `/admin/noticias/nova`
2. **Formulário envia** POST para `/admin/noticias/nova`
3. **Servidor valida** os campos obrigatórios
4. **Função inserirNoticia** (ou db.createNoticia) é chamada
5. **SQLite executa** o INSERT na tabela `noticias`
6. **Banco retorna** o ID da notícia criada
7. **Usuário é redirecionado** para `/admin/noticias?sucesso=true`
8. **Mensagem de sucesso** é exibida

---

## 📊 Estrutura da Tabela no SQLite

```sql
CREATE TABLE IF NOT EXISTS noticias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  conteudo TEXT NOT NULL,
  imagem_url TEXT,
  video_url TEXT,
  data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  autor TEXT NOT NULL
)
```

---

## ✅ Verificar Funcionamento

### 1. Testar via Painel Admin:
- Acesse: http://localhost:3001/admin/noticias/nova
- Preencha o formulário
- Clique em "Publicar Notícia"
- Verifique a mensagem de sucesso

### 2. Testar via API:
```bash
curl -X POST http://localhost:3001/api/noticias/criar \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Teste via API",
    "conteudo": "Conteúdo de teste",
    "autor": "Sistema"
  }'
```

### 3. Ver no banco:
```bash
sqlite3 noticias.db "SELECT * FROM noticias ORDER BY id DESC LIMIT 1;"
```

---

## 🔒 Segurança

✅ **Prepared Statements:** Proteção contra SQL Injection
✅ **Validação:** Campos obrigatórios verificados
✅ **Error Handling:** Tratamento de erros com try/catch
✅ **Logs:** Mensagens de sucesso e erro no console

---

## 📝 Resumo

✅ Configuração SQLite adicionada no `server.js`
✅ Função `inserirNoticia(dados)` criada e funcional
✅ Rota POST `/admin/noticias/nova` usa a função de inserção
✅ Nova rota API `/api/noticias/criar` disponível
✅ Servidor reiniciado e funcionando na porta 3001

**Tudo pronto para criar notícias! 🎉**
