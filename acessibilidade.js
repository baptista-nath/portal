// =============================
// Acessibilidade — Funções Globais
// =============================

// Controle de fonte
let tamanhoFonte = 80;
let contrasteAtivo = false;

// Aumentar fonte
function aumentarFonte() {
  if (tamanhoFonte < 150) {
    tamanhoFonte += 10;
    document.documentElement.style.fontSize = tamanhoFonte + '%';
  }
}

// Diminuir fonte
function diminuirFonte() {
  if (tamanhoFonte > 80) {
    tamanhoFonte -= 10;
    document.documentElement.style.fontSize = tamanhoFonte + '%';
  }
}

// Alternar alto contraste
function toggleContraste() {
  contrasteAtivo = !contrasteAtivo;
  document.body.style.filter = contrasteAtivo
    ? 'invert(1) hue-rotate(180deg)'
    : 'none';
}

// =============================
// VLibras — Acessível em todas as páginas
// =============================
function abrirLibras() {
  const botao = document.querySelector('.vlibras-plugin-button');
  if (botao) botao.click();
}

// =============================
// Informações sobre acessibilidade
// =============================
function infoAcessibilidade() {
  alert(
    'Recursos de Acessibilidade:\n\n• A+ / A- : Aumentar e diminuir tamanho da fonte\n• Alto Contraste: Inverter cores\n• Libras: Tradução automática em Libras (VLibras)\n• Este ícone: Informações sobre acessibilidade'
  );
}

// =============================
// WhatsApp Contato
// =============================
function contato() {
  const numeroWhatsApp = '5594991338686';
  const mensagem = encodeURIComponent(
    'Olá! Gostaria de mais informações sobre o Jornal Marabá.'
  );
  window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, '_blank');
}
