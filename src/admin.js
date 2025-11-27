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
    
    console.log('\n📝 === INICIANDO CRIAÇÃO DE NOTÍCIA ===');
    console.log(`📋 Título: ${titulo}`);
    console.log(`👤 Autor: ${autor}`);
    
    // Validação básica
    if (!titulo || !conteudo || !autor) {
      console.log('❌ Validação falhou: campos obrigatórios ausentes');
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
      console.log(`📁 Caminho completo: ${imagemFinal}`);
    } else if (imagem_url) {
      console.log(`🔗 URL de imagem fornecida: ${imagem_url}`);
    }
    
    // Inserir notícia no banco de dados SQLite
    // db.createNoticia() executa: INSERT INTO noticias (titulo, subtitulo, conteudo, ...)
    console.log('💾 Inserindo notícia no banco de dados...');
    const resultado = await db.createNoticia({
      titulo,
      subtitulo: subtitulo || '',
      conteudo,
      imagem_url: imagemFinal,
      video_url: video_url || '',
      autor
    });
    
    console.log(`✅ ✅ ✅ NOTÍCIA SALVA COM SUCESSO! ✅ ✅ ✅`);
    console.log(`🆔 ID da notícia: ${resultado.id}`);
    console.log(`📰 Título: "${titulo}"`);
    console.log(`👤 Autor: ${autor}`);
    console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
    console.log('='.repeat(50));
    
    res.redirect('/admin/noticias?sucesso=true');
  } catch (error) {
    console.error('\n❌ ❌ ❌ ERRO AO CRIAR NOTÍCIA ❌ ❌ ❌');
    console.error('Detalhes do erro:', error);
    console.error('='.repeat(50));
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
    console.log(`\n✏️ === CARREGANDO FORMULÁRIO DE EDIÇÃO ===`);
    console.log(`🆔 ID da notícia: ${req.params.id}`);
    
    const noticia = await db.getNoticiaById(req.params.id);
    
    if (!noticia) {
      console.log(`❌ Notícia ID ${req.params.id} não encontrada`);
      return res.status(404).send('Notícia não encontrada');
    }
    
    console.log(`✅ Notícia encontrada: "${noticia.titulo}"`);
    console.log(`📅 Publicada em: ${noticia.data_publicacao}`);
    res.render('admin-editar-noticia', { noticia, erro: null });
  } catch (error) {
    console.error('\n❌ Erro ao buscar notícia:', error);
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
    
    console.log(`\n✏️ === ATUALIZANDO NOTÍCIA ===`);
    console.log(`🆔 ID: ${req.params.id}`);
    console.log(`📋 Novo título: ${titulo}`);
    console.log(`👤 Autor: ${autor}`);
    
    // Validação básica
    if (!titulo || !conteudo || !autor) {
      console.log('❌ Validação falhou: campos obrigatórios ausentes');
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
      console.log(`📁 Caminho: ${imagemFinal}`);
    } else if (imagemFinal) {
      console.log(`🖼️  Mantendo imagem atual: ${imagemFinal}`);
    }
    
    // Atualizar no banco de dados
    // db.updateNoticia() executa: UPDATE noticias SET ... WHERE id = ?
    console.log('💾 Atualizando notícia no banco de dados...');
    await db.updateNoticia(req.params.id, {
      titulo,
      subtitulo: subtitulo || '',
      conteudo,
      imagem_url: imagemFinal,
      video_url: video_url || '',
      autor
    });
    
    console.log(`✅ ✅ ✅ NOTÍCIA ATUALIZADA COM SUCESSO! ✅ ✅ ✅`);
    console.log(`🆔 ID: ${req.params.id}`);
    console.log(`📰 Título: "${titulo}"`);
    console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
    console.log('='.repeat(50));
    
    res.redirect('/admin/noticias?atualizado=true');
  } catch (error) {
    console.error('\n❌ ❌ ❌ ERRO AO ATUALIZAR NOTÍCIA ❌ ❌ ❌');
    console.error('Detalhes:', error);
    console.error('='.repeat(50));
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
    console.log(`\n🗑️  === DELETANDO NOTÍCIA ===`);
    console.log(`🆔 ID: ${req.params.id}`);
    
    // Buscar informações da notícia antes de deletar
    const noticia = await db.getNoticiaById(req.params.id);
    
    if (noticia) {
      console.log(`📰 Título: "${noticia.titulo}"`);
      console.log(`👤 Autor: ${noticia.autor}`);
    }
    
    // db.deleteNoticia() executa: DELETE FROM noticias WHERE id = ?
    console.log('💾 Removendo notícia do banco de dados...');
    await db.deleteNoticia(req.params.id);
    
    console.log(`✅ ✅ ✅ NOTÍCIA DELETADA COM SUCESSO! ✅ ✅ ✅`);
    console.log(`🆔 ID deletado: ${req.params.id}`);
    console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
    console.log('='.repeat(50));
    
    res.redirect('/admin/noticias?deletado=true');
  } catch (error) {
    console.error('\n❌ ❌ ❌ ERRO AO DELETAR NOTÍCIA ❌ ❌ ❌');
    console.error('ID:', req.params.id);
    console.error('Detalhes:', error);
    console.error('='.repeat(50));
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
