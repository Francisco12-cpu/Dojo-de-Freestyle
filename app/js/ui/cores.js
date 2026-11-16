// cores.js — lê as cores do tema (variáveis de css/tokens.css) para usar no canvas.
// Assim o desenho segue o tema e não há cor escrita no código.
export const cor = (nome) =>
  getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
