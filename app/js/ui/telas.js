// telas.js — troca entre as telas pelo hash (#inicio, #modos...). O botão voltar do celular
// funciona porque cada troca é uma entrada no histórico do navegador.
export const TELAS = ['inicio', 'modos', 'treino', 'resultado', 'evolucao', 'caderno', 'ajustes', 'laboratorio'];
const TELA_PADRAO = 'inicio';

const aoEntrarMap = new Map();

// fn() roda toda vez que a tela `nome` aparece (útil para ligar/desligar o que a tela usa).
export function aoEntrar(nome, fn) {
  aoEntrarMap.set(nome, fn);
}

export function telaAtual() {
  const nome = location.hash.slice(1);
  return TELAS.includes(nome) ? nome : TELA_PADRAO;
}

function mostrar() {
  const nome = location.hash.slice(1);
  if (!TELAS.includes(nome)) history.replaceState(null, '', '#' + TELA_PADRAO);
  const alvo = telaAtual();
  for (const sec of document.querySelectorAll('main > section')) sec.hidden = sec.id !== alvo;
  for (const a of document.querySelectorAll('.nav > a')) a.classList.toggle('ativo', a.getAttribute('href') === '#' + alvo);
  window.scrollTo(0, 0);
  aoEntrarMap.get(alvo)?.();
}

// Vai para a tela `nome`. Se já estiver nela, só redesenha.
export function ir(nome) {
  if (location.hash === '#' + nome) mostrar();
  else location.hash = nome;
}

export function iniciarTelas() {
  window.addEventListener('hashchange', mostrar);
  mostrar();
}
