// catalogo.js — os 10 modos da especificação (7). Os que já existem têm `modo` (ativo).
// Os de toque entram no treino pelo módulo do modo; os outros aparecem como "em breve".
import { modo as acheO1 } from './ache-o-1.js';
import { modo as queTempo } from './que-tempo.js';
import { modo as preveja } from './preveja-mudanca.js';
import { modo as beatFantasma } from './beat-fantasma.js';

export const MODOS_TOQUE = {
  [acheO1.id]: acheO1,
  [queTempo.id]: queTempo,
  [preveja.id]: preveja,
  [beatFantasma.id]: beatFantasma,
};

// Lista completa da tela Modos, na ordem da spec.
export const CATALOGO = [
  { id: 'ache-o-1', nome: 'Ache o 1', ativo: true },
  { id: 'que-tempo', nome: 'Que tempo foi?', ativo: true },
  { id: 'preveja-mudanca', nome: 'Preveja a mudança', ativo: true },
  { id: 'beat-fantasma', nome: 'Beat fantasma', ativo: true },
  { id: 'pega-o-beat', nome: 'Pega o beat', ativo: false },
  { id: 'rima-no-4', nome: 'Rima no 4', ativo: false },
  { id: 'palavra-alvo', nome: 'Palavra-alvo', ativo: false },
  { id: 'quatro-palavras', nome: 'Quatro palavras', ativo: false },
  { id: 'batalha', nome: 'Batalha', ativo: false },
  { id: 'livre', nome: 'Livre', ativo: false },
];
