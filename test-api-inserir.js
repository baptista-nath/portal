/**
 * Script de Teste - Inserção de Notícia via API
 * 
 * Este script testa a função inserirNoticia() através da rota POST
 * 
 * Uso: node test-api-inserir.js
 */

const http = require('http');

// Dados da notícia de teste
const noticiaTest = {
  titulo: "TESTE: Nova notícia inserida via API",
  subtitulo: "Sistema de inserção funcionando perfeitamente",
  conteudo: "Esta é uma notícia de teste criada automaticamente pelo script test-api-inserir.js. O sistema está validando que a função inserirNoticia() está operacional e salvando corretamente os dados no banco jornal_maraba.sqlite.",
  imagem_url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
  video_url: "",
  autor: "Sistema de Teste Automático"
};

// Converter objeto para JSON
const postData = JSON.stringify(noticiaTest);

// Configurar requisição HTTP
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/noticias/criar',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('\n📝 === TESTE DE INSERÇÃO DE NOTÍCIA ===\n');
console.log('📋 Dados a serem inseridos:');
console.log(`   Título: ${noticiaTest.titulo}`);
console.log(`   Autor: ${noticiaTest.autor}`);
console.log('\n🔄 Enviando requisição para: http://localhost:3001/api/noticias/criar\n');

// Fazer requisição
const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📨 Resposta recebida:');
    console.log(`   Status: ${res.statusCode}`);
    
    if (res.statusCode === 201) {
      const resultado = JSON.parse(data);
      console.log('\n✅ ✅ ✅ SUCESSO! ✅ ✅ ✅');
      console.log(`🆔 ID da notícia: ${resultado.id}`);
      console.log(`📰 Título: ${resultado.titulo}`);
      console.log(`💬 Mensagem: ${resultado.message}`);
      console.log('\n💡 Você pode visualizar a notícia em:');
      console.log(`   📊 Admin: http://localhost:3001/admin/noticias`);
      console.log(`   🌐 Site: http://localhost:3001/`);
    } else {
      console.log('\n❌ ERRO NA REQUISIÇÃO');
      console.log(`   Código: ${res.statusCode}`);
      console.log(`   Resposta: ${data}`);
    }
    console.log('\n' + '='.repeat(50) + '\n');
  });
});

req.on('error', (error) => {
  console.error('\n❌ ❌ ❌ ERRO DE CONEXÃO ❌ ❌ ❌');
  console.error('Detalhes:', error.message);
  console.error('\n💡 Certifique-se de que o servidor está rodando:');
  console.error('   node server.js\n');
});

// Enviar dados
req.write(postData);
req.end();
