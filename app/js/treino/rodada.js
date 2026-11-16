// rodada.js — regras comuns dos modos de toque (Fase 3). Puro: sem AudioContext nem DOM.
// Tempos em segundos do relógio de áudio; erros em milissegundos (negativo = adiantado).
import { mulberry32 } from '../audio/gerador.js';

export { mulberry32 };

// Escolhe um item da lista com o gerador de números `rng` (uma semente gera sempre a mesma sequência).
export const sortear = (rng, lista) => lista[Math.floor(rng() * lista.length)];

// Erro de UM toque contra o alvo mais próximo. Desconta a latência de toque (toqueMs).
// Devolve { erroMs, indice } ou null se não há alvos.
export function erroDoToque(tempoToque, alvos, toqueMs = 0) {
  if (!alvos.length) return null;
  const corrigido = tempoToque - toqueMs / 1000;
  let melhor = 0;
  for (let i = 1; i < alvos.length; i++) {
    if (Math.abs(alvos[i] - corrigido) < Math.abs(alvos[melhor] - corrigido)) melhor = i;
  }
  return { erroMs: (corrigido - alvos[melhor]) * 1000, indice: melhor };
}

// Casa cada toque com o alvo mais próximo, até maxMs de distância. Cada alvo aceita um toque só.
// Toques que não casam (fora da janela ou repetidos no mesmo alvo) são "extras" e contam como erro.
// Devolve { errosMs, perdidos, extras } — `perdidos` são os alvos sem toque.
export function avaliarAlvos(toques, alvos, { toqueMs = 0, maxMs = 350 } = {}) {
  const usados = new Set();
  const errosMs = [];
  let extras = 0;
  for (const t of toques) {
    const r = erroDoToque(t, alvos, toqueMs);
    if (!r || Math.abs(r.erroMs) > maxMs || usados.has(r.indice)) { extras++; continue; }
    usados.add(r.indice);
    errosMs.push(r.erroMs);
  }
  return { errosMs, perdidos: alvos.length - usados.size, extras };
}

// Modo "Preveja a mudança": o toque acerta se estiver a até um tempo (duracaoTempoMs) do início da seção.
export const acertoDaMudanca = (erroMs, duracaoTempoMs) => Math.abs(erroMs) <= duracaoTempoMs;

export const duracaoTempoMs = (bpm) => 60000 / bpm;
