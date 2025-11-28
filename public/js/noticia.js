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

// Função para obter ID da URL
function obterIdDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Função para extrair ID do YouTube
function extrairIdYouTube(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Função para extrair ID do Vimeo
function extrairIdVimeo(url) {
  const regex = /vimeo\.com\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Função para renderizar vídeo
function renderizarVideo(videoUrl) {
  if (!videoUrl) return '';
  
  const youtubeId = extrairIdYouTube(videoUrl);
  if (youtubeId) {
    return `
      <div class="aspect-w-16 aspect-h-9 mb-6">
        <iframe 
          class="w-full h-64 sm:h-80 md:h-96 rounded-lg"
          src="https://www.youtube.com/embed/${youtubeId}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;
  }
  
  const vimeoId = extrairIdVimeo(videoUrl);
  if (vimeoId) {
    return `
      <div class="aspect-w-16 aspect-h-9 mb-6">
        <iframe 
          class="w-full h-64 sm:h-80 md:h-96 rounded-lg"
          src="https://player.vimeo.com/video/${vimeoId}" 
          frameborder="0" 
          allow="autoplay; fullscreen; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;
  }
  
  return '';
}

// Carregar notícia
async function carregarNoticia() {
  const noticiaId = obterIdDaUrl();
  const container = document.getElementById('noticia-container');
  const loading = document.getElementById('loading');
  
  if (!noticiaId) {
    container.innerHTML = `
      <div class="text-center py-12 px-4">
        <p class="text-red-600 text-base sm:text-lg">ID da notícia não encontrado.</p>
        <a href="/" class="mt-4 inline-block bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base">
          Voltar para Home
        </a>
      </div>
    `;
    return;
  }
  
  try {
    const response = await fetch(`/api/noticias/${noticiaId}`);
    
    if (!response.ok) {
      throw new Error('Notícia não encontrada');
    }
    
    const noticia = await response.json();
    loading.classList.add('hidden');
    
    const imagemUrl = noticia.imagem_url || 'https://via.placeholder.com/1200x600?text=Sem+Imagem';
    
    container.innerHTML = `
      <article class="bg-white rounded-lg shadow-lg overflow-hidden">
        ${noticia.imagem_url ? `
          <div class="w-full h-48 sm:h-64 md:h-96 overflow-hidden">
            <img 
              src="${imagemUrl}" 
              alt="${noticia.titulo}"
              class="w-full h-full object-cover"
              onerror="this.src='https://via.placeholder.com/1200x600?text=Imagem+Indisponível'"
            >
          </div>
        ` : ''}
        
        <div class="p-4 sm:p-6 md:p-8">
          <div class="mb-4 sm:mb-6">
            <a href="/" class="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center text-sm sm:text-base">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Voltar para Home
            </a>
          </div>
          
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">${noticia.titulo}</h1>
          
          ${noticia.subtitulo ? `
            <p class="text-lg sm:text-xl text-gray-700 font-medium mb-4 sm:mb-6">${noticia.subtitulo}</p>
          ` : ''}
          
          <div class="flex flex-wrap items-center text-gray-600 text-xs sm:text-sm mb-6 sm:mb-8 pb-4 sm:pb-6 border-b gap-2">
            <div class="flex items-center">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
              <span class="font-medium">${noticia.autor}</span>
            </div>
            <span class="hidden sm:inline">•</span>
            <div class="flex items-center">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
              </svg>
              <span>${formatarData(noticia.data_publicacao)}</span>
            </div>
          </div>
          
          ${renderizarVideo(noticia.video_url)}
          
          <div class="prose prose-sm sm:prose-base md:prose-lg max-w-none">
            <p class="text-gray-800 leading-relaxed whitespace-pre-line">${noticia.conteudo}</p>
          </div>
        </div>
      </article>
      
      <div class="mt-6 sm:mt-8 text-center">
        <a href="/" class="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center text-sm sm:text-base">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Voltar para Home
        </a>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar notícia:', error);
    loading.classList.add('hidden');
    container.innerHTML = `
      <div class="text-center py-12 px-4">
        <svg class="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="mt-4 text-base sm:text-xl text-red-600">Erro ao carregar notícia. Notícia não encontrada.</p>
        <a href="/" class="mt-4 inline-block bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base">
          Voltar para Home
        </a>
      </div>
    `;
  }
}

// Carregar notícia ao carregar a página
document.addEventListener('DOMContentLoaded', carregarNoticia);
