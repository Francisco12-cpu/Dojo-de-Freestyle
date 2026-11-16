// gerador.js — gera beats de 32 compassos que se repetem, divididos em seções de 4 ou 8
// compassos. Puro (sem AudioContext): só descreve QUAIS notas tocam em QUAL passo.
// Quem toca de verdade é bateria.js. O mesmo `semente` sempre gera o mesmo beat.
import { PASSOS } from './tempo.js';

export const TOTAL_COMPASSOS = 32;
export const SEMITONS = [0, 3, 7, 10]; // grau 1, 3 menor, 5 e 7 menor sobre a tônica

// Para trap o BPM é o "BPM sentido" (metade do BPM escrito nas músicas), para que a caixa
// caia nos tempos 2 e 4 da contagem 1-2-3-4 que o rapper faz.
export const ESTILOS = {
  boombap: { nome: 'Boom bap', bpm: [84, 96],  swing: 0.12, bumbo: { escolher: 2, entre: [6, 8, 10, 11] }, chimbal: 2 },
  lento:   { nome: 'Lento',    bpm: [70, 80],  swing: 0.06, bumbo: { fixos: [8] },                          chimbal: 4 },
  trap:    { nome: 'Trap',     bpm: [66, 76],  swing: 0,    bumbo: { escolher: 2, entre: [3, 7, 10, 14] }, chimbal: 1, rolos: 2 },
  rapido:  { nome: 'Rápido',   bpm: [100, 110], swing: 0.08, bumbo: { fixos: [8, 10] },                    chimbal: 2 },
};

export function mulberry32(semente) {
  let a = semente >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const inteiro = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const escolher = (rng, lista) => lista[Math.floor(rng() * lista.length)];
const numerico = (a, b) => a - b;
function sortearSem(rng, lista, qtd) {
  const pool = [...lista], saida = [];
  while (saida.length < qtd && pool.length) saida.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return saida.sort(numerico);
}

const POOL_EXTRA_BUMBO = [3, 6, 7, 10, 11, 14];
const POOL_BAIXO = [3, 6, 8, 10, 12, 14];
const OPCOES_CHIMBAL = [1, 2, 4];

function sortearAtributos(rng, e, primeira) {
  let bumboExtra;
  if (e.bumbo.escolher) bumboExtra = sortearSem(rng, e.bumbo.entre, e.bumbo.escolher);
  else {
    bumboExtra = [...e.bumbo.fixos];
    if (!primeira && rng() < 0.6) {
      const livres = POOL_EXTRA_BUMBO.filter((p) => !bumboExtra.includes(p));
      bumboExtra.push(escolher(rng, livres));
      bumboExtra.sort(numerico);
    }
  }
  const chimbalPasso = primeira ? e.chimbal : escolher(rng, OPCOES_CHIMBAL);
  // linha do baixo: o passo 0 sempre toca o grau 1 (offset 0); mais 1 a 3 notas
  const baixo = [{ passo: 0, grau: 0 }];
  for (const p of sortearSem(rng, POOL_BAIXO, inteiro(rng, 1, 3))) baixo.push({ passo: p, grau: escolher(rng, SEMITONS) });
  const acorde = rng() < 0.55 ? escolher(rng, SEMITONS) : null;
  return { bumboExtra, chimbalPasso, baixo, acorde };
}

function diferencas(a, b) {
  const j = JSON.stringify;
  return [j(a.bumboExtra) !== j(b.bumboExtra), a.chimbalPasso !== b.chimbalPasso,
    j(a.baixo) !== j(b.baixo), a.acorde !== b.acorde].filter(Boolean).length;
}

function zeros() { return new Array(PASSOS).fill(0); }

function montarPadrao(a, estilo) {
  const bumbo = zeros(), caixa = zeros(), chimbal = zeros(), baixo = new Array(PASSOS).fill(null);
  bumbo[0] = 1;
  for (const p of a.bumboExtra) bumbo[p] = 0.8;
  caixa[4] = 1; caixa[12] = 1; // caixa nos tempos 2 e 4, sempre
  for (let p = 0; p < PASSOS; p += a.chimbalPasso) chimbal[p] = p % 4 === 0 ? 0.5 : 0.3;
  for (const { passo, grau } of a.baixo) baixo[passo] = grau;
  // rolos (trap): passos com 3 toques rápidos no chimbal. Preenchido em gerarBeat.
  return { bumbo, caixa, chimbal, baixo, rolos: [] };
}

// Último compasso da seção: o chimbal para nos passos 12 a 15 e a caixa rola (12, 14 e 15).
// É o aviso sonoro de que o beat vai mudar.
function montarVirada(pad) {
  const v = { bumbo: [...pad.bumbo], caixa: [...pad.caixa], chimbal: [...pad.chimbal], baixo: [...pad.baixo], rolos: pad.rolos.filter((p) => p < 12) };
  for (let p = 12; p < PASSOS; p++) v.chimbal[p] = 0;
  v.caixa[12] = 1; v.caixa[14] = 0.8; v.caixa[15] = 0.9;
  return v;
}

const TAMANHOS = [[8, 8, 8, 8], [8, 4, 4, 8, 8], [4, 4, 8, 8, 8]];

// pausas: probabilidade (0 a 1) de uma seção começar com 1 compasso SEM bumbo e SEM baixo.
// Em 0 (padrão), o bumbo cai no passo 0 de todo compasso. Use > 0 só nas faixas avançadas.
export function gerarBeat({ estilo = 'boombap', bpm, semente = 1, pausas = 0 } = {}) {
  const e = ESTILOS[estilo];
  if (!e) throw new Error(`estilo desconhecido: ${estilo}`);
  const rng = mulberry32(semente);
  const bpmFinal = bpm ?? inteiro(rng, e.bpm[0], e.bpm[1]);
  const tonica = inteiro(rng, 33, 40); // nota MIDI (A1 a E2)
  const tamanhos = escolher(rng, TAMANHOS);
  const secoes = [];
  let inicio = 0, anterior = null;
  for (const tamanho of tamanhos) {
    let atributos = sortearAtributos(rng, e, anterior === null);
    if (anterior) {
      for (let tent = 0; tent < 50 && diferencas(atributos, anterior) < 2; tent++) atributos = sortearAtributos(rng, e, false);
      // garantia: se ainda estiver parecida, força duas diferenças
      if (diferencas(atributos, anterior) < 2) {
        atributos.chimbalPasso = OPCOES_CHIMBAL.find((c) => c !== anterior.chimbalPasso);
        atributos.acorde = anterior.acorde === null ? SEMITONS[1] : null;
      }
    }
    const padrao = montarPadrao(atributos, e);
    if (e.rolos && atributos.chimbalPasso === 1) {
      padrao.rolos = sortearSem(rng, [1, 3, 5, 7, 9, 11], e.rolos); // passos ímpares antes do 12
    }
    secoes.push({ inicio, tamanho, atributos, padrao, virada: montarVirada(padrao), pausa: rng() < pausas });
    inicio += tamanho;
    anterior = atributos;
  }
  return { estilo, bpm: bpmFinal, swing: e.swing, tonica, semente, secoes };
}

// Em que seção está o compasso n (o beat se repete a cada 32 compassos).
// ateMudar = quantos compassos faltam até a mudança, contando o atual: no ÚLTIMO compasso da seção vale 1.
export function secaoDoCompasso(beat, n) {
  const k = ((n % TOTAL_COMPASSOS) + TOTAL_COMPASSOS) % TOTAL_COMPASSOS;
  for (let i = 0; i < beat.secoes.length; i++) {
    const s = beat.secoes[i];
    if (k >= s.inicio && k < s.inicio + s.tamanho) {
      const compassoNaSecao = k - s.inicio;
      return { indice: i, compassoNaSecao, tamanho: s.tamanho, ateMudar: s.tamanho - compassoNaSecao };
    }
  }
  throw new Error('compasso fora do beat');
}

// Eventos do compasso n: [{ instrumento, passo, volume, nota?, rolo? }], instrumento em
// 'bumbo' | 'caixa' | 'chimbal' | 'baixo' | 'acorde'. `nota` é MIDI (baixo e acorde).
export function eventosDoCompasso(beat, n) {
  const info = secaoDoCompasso(beat, n);
  const sec = beat.secoes[info.indice];
  const pad = info.ateMudar === 1 ? sec.virada : sec.padrao;
  const semBase = sec.pausa && info.compassoNaSecao === 0;
  const ev = [];
  for (let p = 0; p < PASSOS; p++) {
    if (!semBase && pad.bumbo[p]) ev.push({ instrumento: 'bumbo', passo: p, volume: pad.bumbo[p] });
    if (pad.caixa[p]) ev.push({ instrumento: 'caixa', passo: p, volume: pad.caixa[p] });
    if (pad.chimbal[p]) ev.push({ instrumento: 'chimbal', passo: p, volume: pad.chimbal[p], rolo: pad.rolos.includes(p) ? 3 : 0 });
    if (!semBase && pad.baixo[p] !== null) ev.push({ instrumento: 'baixo', passo: p, volume: 0.7, nota: beat.tonica + pad.baixo[p] });
  }
  if (sec.atributos.acorde !== null) ev.push({ instrumento: 'acorde', passo: 0, volume: 0.5, nota: beat.tonica + 24 + sec.atributos.acorde });
  return ev;
}
