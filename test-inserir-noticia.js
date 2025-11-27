/**
 * Script de Teste - Demonstração da função inserirNoticia()
 * 
 * Este arquivo demonstra como usar a função inserirNoticia() para
 * adicionar notícias programaticamente ao banco de dados SQLite.
 * 
 * Uso: node test-inserir-noticia.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'noticias.db');
const database = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite');
  }
});

/**
 * Função inserirNoticia - Insere uma nova notícia no banco de dados
 * 
 * @param {Object} dados - Objeto com os dados da notícia
 * @param {string} dados.titulo - Título da notícia (obrigatório)
 * @param {string} dados.subtitulo - Subtítulo da notícia (opcional)
 * @param {string} dados.conteudo - Conteúdo completo da notícia (obrigatório)
 * @param {string} dados.imagem_url - URL da imagem de capa (opcional)
 * @param {string} dados.video_url - URL de vídeo relacionado (opcional)
 * @param {string} dados.autor - Nome do autor (obrigatório)
 * 
 * @returns {Promise} Promise que resolve com o ID da notícia criada
 * 
 * Exemplo de uso:
 * const resultado = await inserirNoticia({
 *   titulo: 'Título da Notícia',
 *   subtitulo: 'Subtítulo opcional',
 *   conteudo: 'Conteúdo completo da notícia...',
 *   imagem_url: 'https://exemplo.com/imagem.jpg',
 *   video_url: 'https://youtube.com/watch?v=xxxxx',
 *   autor: 'Nome do Repórter'
 * });
 */
function inserirNoticia(dados) {
  return new Promise((resolve, reject) => {
    const { titulo, subtitulo, conteudo, imagem_url, video_url, autor } = dados;
    
    // SQL com prepared statements para prevenir SQL Injection
    const sql = `INSERT INTO noticias (titulo, subtitulo, conteudo, imagem_url, video_url, autor, data_publicacao)
                 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`;
    
    // Parâmetros (valores vazios para campos opcionais)
    const params = [
      titulo, 
      subtitulo || '', 
      conteudo, 
      imagem_url || '', 
      video_url || '', 
      autor
    ];
    
    // Executar inserção
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

// ============================================
// TESTE: Inserir uma notícia de exemplo
// ============================================

async function testarInsercao() {
  try {
    console.log('\n📝 Iniciando teste de inserção de notícia...\n');
    
    // Dados da notícia de teste
    const noticiaTest = {
      titulo: 'Teste de Inserção Automática',
      subtitulo: 'Demonstrando a função inserirNoticia()',
      conteudo: 'Este é um teste automático da função inserirNoticia(). A função utiliza prepared statements do SQLite para inserir dados de forma segura no banco de dados, prevenindo SQL Injection e garantindo a integridade dos dados.',
      imagem_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
      video_url: '',
      autor: 'Sistema Automático'
    };
    
    // Inserir notícia
    const resultado = await inserirNoticia(noticiaTest);
    
    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('───────────────────────────────');
    console.log(`📌 ID da notícia: ${resultado.id}`);
    console.log(`📌 Título: ${resultado.titulo}`);
    console.log(`📌 Mensagem: ${resultado.message}`);
    
    console.log('\n💡 A notícia foi inserida no banco de dados.');
    console.log('💡 Você pode visualizá-la em: http://localhost:3001/admin/noticias\n');
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
  } finally {
    // Fechar conexão com o banco
    database.close((err) => {
      if (err) {
        console.error('Erro ao fechar banco:', err.message);
      } else {
        console.log('🔒 Conexão com banco de dados fechada.\n');
      }
    });
  }
}

// Executar teste
testarInsercao();
