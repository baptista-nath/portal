const express = require('express');
const router = express.Router();
const db = require('./database');
const multer = require('multer');
const path = require('path');

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

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
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Página principal de listagem de notícias do admin
router.get('/noticias', async (req, res) => {
  try {
    const noticias = await db.getAllNoticias();
    res.render('admin-lista', { noticias, query: req.query });
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    res.status(500).send('Erro ao buscar notícias');
  }
});

// Página de formulário para nova notícia
router.get('/noticias/nova', (req, res) => {
  res.render('admin-nova-noticia', { noticia: null, erro: null });
});

// Criar nova notícia (POST)
// Esta rota é chamada quando o formulário em /admin/noticias/nova é submetido
// A função db.createNoticia() (equivalente a inserirNoticia) salva os dados no SQLite
// Agora com suporte para upload de imagem via Multer
router.post('/noticias/nova', upload.single('imagem'), async (req, res) => {
  try {
    const { titulo, subtitulo, conteudo, imagem_url, video_url, autor } = req.body;
    
    // Validação básica
    if (!titulo || !conteudo || !autor) {
      return res.render('admin-nova-noticia', { 
        noticia: req.body, 
        erro: 'Título, conteúdo e autor são obrigatórios' 
      });
    }
    
    // Determinar a URL da imagem: usar arquivo enviado ou URL fornecida
    let imagemFinal = imagem_url || '';
    if (req.file) {
      // Se um arquivo foi enviado, usar o caminho do arquivo
      imagemFinal = '/uploads/' + req.file.filename;
      console.log(`📸 Imagem enviada: ${req.file.filename}`);
    }
    
    // Inserir notícia no banco de dados SQLite
    // db.createNoticia() executa: INSERT INTO noticias (titulo, subtitulo, conteudo, ...)
    const resultado = await db.createNoticia({
      titulo,
      subtitulo: subtitulo || '',
      conteudo,
      imagem_url: imagemFinal,
      video_url: video_url || '',
      autor
    });
    
    console.log(`✅ Notícia criada com ID: ${resultado.id}`);
    res.redirect('/admin/noticias?sucesso=true');
  } catch (error) {
    console.error('Erro ao criar notícia:', error);
    res.render('admin-nova-noticia', { 
      noticia: req.body, 
      erro: 'Erro ao criar notícia. Tente novamente.' 
    });
  }
});

// Página de edição de notícia (GET)
// Rota: /admin/noticias/editar/:id
// Exibe o formulário de edição preenchido com os dados da notícia
router.get('/noticias/editar/:id', async (req, res) => {
  try {
    const noticia = await db.getNoticiaById(req.params.id);
    if (!noticia) {
      return res.status(404).send('Notícia não encontrada');
    }
    res.render('admin-editar-noticia', { noticia, erro: null });
  } catch (error) {
    console.error('Erro ao buscar notícia:', error);
    res.status(500).send('Erro ao buscar notícia');
  }
});

// Atualizar notícia (POST)
// Rota: /admin/noticias/editar/:id
// Processa o formulário de edição e atualiza a notícia no banco
// Agora com suporte para upload de nova imagem
router.post('/noticias/editar/:id', upload.single('imagem'), async (req, res) => {
  try {
    const { titulo, subtitulo, conteudo, imagem_url, video_url, autor } = req.body;
    
    // Validação básica
    if (!titulo || !conteudo || !autor) {
      const noticia = await db.getNoticiaById(req.params.id);
      return res.render('admin-editar-noticia', { 
        noticia: { ...noticia, ...req.body }, 
        erro: 'Título, conteúdo e autor são obrigatórios' 
      });
    }
    
    // Determinar a URL da imagem
    const noticiaAtual = await db.getNoticiaById(req.params.id);
    let imagemFinal = imagem_url || noticiaAtual.imagem_url || '';
    
    if (req.file) {
      // Se um novo arquivo foi enviado, usar o caminho do novo arquivo
      imagemFinal = '/uploads/' + req.file.filename;
      console.log(`📸 Nova imagem enviada: ${req.file.filename}`);
    }
    
    // Atualizar no banco de dados
    // db.updateNoticia() executa: UPDATE noticias SET ... WHERE id = ?
    await db.updateNoticia(req.params.id, {
      titulo,
      subtitulo: subtitulo || '',
      conteudo,
      imagem_url: imagemFinal,
      video_url: video_url || '',
      autor
    });
    
    console.log(`✅ Notícia ID ${req.params.id} atualizada com sucesso`);
    res.redirect('/admin/noticias?atualizado=true');
  } catch (error) {
    console.error('Erro ao atualizar notícia:', error);
    const noticia = await db.getNoticiaById(req.params.id);
    res.render('admin-editar-noticia', { 
      noticia: { ...noticia, ...req.body }, 
      erro: 'Erro ao atualizar notícia. Tente novamente.' 
    });
  }
});

// Deletar notícia (POST)
// Rota: /admin/noticias/deletar/:id
// Remove a notícia do banco de dados
router.post('/noticias/deletar/:id', async (req, res) => {
  try {
    // db.deleteNoticia() executa: DELETE FROM noticias WHERE id = ?
    await db.deleteNoticia(req.params.id);
    console.log(`✅ Notícia ID ${req.params.id} deletada com sucesso`);
    res.redirect('/admin/noticias?deletado=true');
  } catch (error) {
    console.error('Erro ao deletar notícia:', error);
    res.redirect('/admin/noticias?erro=delete');
  }
});

// Rota alternativa para excluir (alias para deletar)
// Rota: /admin/noticias/excluir/:id
router.post('/noticias/excluir/:id', async (req, res) => {
  try {
    await db.deleteNoticia(req.params.id);
    console.log(`✅ Notícia ID ${req.params.id} excluída com sucesso`);
    res.redirect('/admin/noticias?deletado=true');
  } catch (error) {
    console.error('Erro ao excluir notícia:', error);
    res.redirect('/admin/noticias?erro=delete');
  }
});

module.exports = router;
