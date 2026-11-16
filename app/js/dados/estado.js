// estado.js — o estado do app na memória, espelhado no localStorage (chave dojo.v2).
// Se o localStorage estiver bloqueado, o app continua funcionando só com a memória.
import { carregar, salvar } from './armazenamento.js';

function armazen() {
  try { return window.localStorage; } catch { return null; }
}

let atual = carregar(armazen());

export const estado = () => atual;

// Recebe uma função que altera o objeto e grava na hora.
export function alterarEstado(fn) {
  fn(atual);
  salvar(armazen(), atual);
  return atual;
}

// Troca tudo (usado na importação, depois de confirmar).
export function substituirEstado(novo) {
  atual = novo;
  salvar(armazen(), atual);
  return atual;
}
