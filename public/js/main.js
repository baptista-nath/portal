// Função para formatar data
function formatarData(dataString) {
  const data = new Date(dataString);
  const opcoes = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return data.toLocaleDateString('pt-BR', opcoes);
}

// Função para truncar texto
function truncarTexto(texto, limite = 150) {
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite) + '...';
}

// Função para criar card de notícia
function criarCardNoticia(noticia) {
  const imagemUrl = noticia.imagem_url || 'https://via.placeholder.com/400x250?text=Sem+Imagem';
  
  return `
    <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div class="relative h-48 overflow-hidden">
        <img 
          src="${imagemUrl}" 
          alt="${noticia.titulo}"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onerror="this.src='https://via.placeholder.com/400x250?text=Imagem+Indisponível'"
        >
        ${noticia.video_url ? '<div class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">VÍDEO</div>' : ''}
      </div>
      
      <div class="p-6 flex flex-col flex-grow">
        <div class="flex items-center text-sm text-gray-500 mb-3">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
          </svg>
          <span>${noticia.autor}</span>
          <span class="mx-2">•</span>
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>
          <span>${formatarData(noticia.data_publicacao)}</span>
        </div>
        
        <h3 class="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
          <a href="/noticia.html?id=${noticia.id}">${noticia.titulo}</a>
        </h3>
        
        ${noticia.subtitulo ? `<p class="text-gray-700 font-medium mb-2">${noticia.subtitulo}</p>` : ''}
        
        <p class="text-gray-600 mb-4 flex-grow">
          ${truncarTexto(noticia.conteudo, 120)}
        </p>
        
        <a 
          href="/noticia.html?id=${noticia.id}" 
          class="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors mt-auto"
        >
          Ler mais
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </article>
  `;
}

// Carregar notícias
async function carregarNoticias() {
  const container = document.getElementById('noticias-container');
  const noNoticias = document.getElementById('no-noticias');
  
  try {
    const response = await fetch('/api/noticias?limit=6');
    const noticias = await response.json();
    
    if (noticias.length === 0) {
      container.innerHTML = '';
      noNoticias.classList.remove('hidden');
    } else {
      container.innerHTML = noticias.map(noticia => criarCardNoticia(noticia)).join('');
      noNoticias.classList.add('hidden');
    }
  } catch (error) {
    console.error('Erro ao carregar notícias:', error);
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-red-600 text-lg">Erro ao carregar notícias. Tente novamente mais tarde.</p>
      </div>
    `;
  }
}

// Carregar notícias ao carregar a página
document.addEventListener('DOMContentLoaded', carregarNoticias);
