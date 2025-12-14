// =============================
// Acessibilidade — Funções
// =============================

let tamanhoFonte = 100;
let contrasteAtivo = false;

// Aumentar fonte
function aumentarFonte() {
  if (tamanhoFonte < 150) {
    tamanhoFonte += 10;
    document.documentElement.style.fontSize = tamanhoFonte + "%";
  }
}

// Diminuir fonte
function diminuirFonte() {
  if (tamanhoFonte > 80) {
    tamanhoFonte -= 10;
    document.documentElement.style.fontSize = tamanhoFonte + "%";
  }
}

// Alto contraste
function toggleContraste() {
  contrasteAtivo = !contrasteAtivo;
  document.body.classList.toggle("contrast", contrasteAtivo);
}

// Abrir modal de acessibilidade
function infoAcessibilidade() {
  const modal = document.getElementById("modalAcessibilidade");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

// Fechar modal
function fecharAcessibilidade() {
  const modal = document.getElementById("modalAcessibilidade");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// Abrir VLibras
function abrirLibras() {
  // Primeiro, tenta selecionar o botão do VLibras
  const botao = document.querySelector('[vw-access-button]');
  
  if (botao) {
    // Clica no botão para abrir o widget
    botao.click();
  } else {
    // Se o botão não for encontrado, tenta inicializar o VLibras novamente
    console.warn('Botão VLibras não encontrado. Tentando reinicializar...');
    
    // Aguarda um pouco e tenta novamente
    setTimeout(() => {
      const botaoRetry = document.querySelector('[vw-access-button]');
      if (botaoRetry) {
        botaoRetry.click();
      } else {
        alert("VLibras ainda não carregou. Por favor, aguarde alguns segundos e tente novamente.");
      }
    }, 1000);
  }
}

// WhatsApp
function contato() {
  const numeroWhatsApp = "55559484331618";
  const mensagem = encodeURIComponent(
    "Olá! Gostaria de mais informações sobre o Jornal Marabá."
  );
  window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, "_blank");
}
