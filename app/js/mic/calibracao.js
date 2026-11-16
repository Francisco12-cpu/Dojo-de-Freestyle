// calibracao.js — calibração do toque (docs/ESPECIFICACAO.md, 4.4, rotina 3).
// Mede quanto tempo o toque na tela leva para chegar ao app, e corrige isso nos modos de toque.
// Parte pura (avaliarToques, filtrarRebote) testada em testes/calibracao.test.mjs.

const CLIQUES = 12;          // cliques de calibração
const BPM = 90;              // andamento dos cliques
const DESCARTAR = 4;         // os 4 primeiros cliques são de aquecimento
const JANELA_S = 0.35;       // toque é pareado com o clique mais próximo, até ±350 ms
const MIN_PARES = 6;         // abaixo disso, a calibração não vale
const DESVIO_MAX_MS = 40;    // mediana dos desvios absolutos (em torno da mediana) tem que ser menor
const REBOTE_S = 0.08;       // dois toques em menos de 80 ms contam como um só

const mediana = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// Dois toques em menos de REBOTE_S viram um só (fica o primeiro).
export function filtrarRebote(toques, janelaS = REBOTE_S) {
  const saida = [];
  for (const t of [...toques].sort((a, b) => a - b)) {
    if (!saida.length || t - saida[saida.length - 1] >= janelaS) saida.push(t);
  }
  return saida;
}

// cliques e toques em segundos (relógio do áudio). Devolve { ok, toqueMs, desvioMs, pares, motivo }.
export function avaliarToques(cliques, toques, opc = {}) {
  const { descartar = DESCARTAR, janela = JANELA_S, minPares = MIN_PARES, desvioMaxMs = DESVIO_MAX_MS } = opc;
  const diffs = [];
  for (const c of cliques.slice(descartar)) {
    let melhor = null;
    for (const t of toques) {
      if (Math.abs(t - c) <= janela && (melhor === null || Math.abs(t - c) < Math.abs(melhor - c))) melhor = t;
    }
    if (melhor !== null) diffs.push((melhor - c) * 1000);
  }
  if (diffs.length < minPares) {
    return { ok: false, toqueMs: null, desvioMs: null, pares: diffs.length, motivo: 'poucos toques pareados' };
  }
  const toqueMs = mediana(diffs);
  const desvioMs = mediana(diffs.map((d) => Math.abs(d - toqueMs)));
  return {
    ok: desvioMs < desvioMaxMs,
    toqueMs: Math.round(toqueMs),
    desvioMs: Math.round(desvioMs),
    pares: diffs.length,
    motivo: desvioMs < desvioMaxMs ? '' : 'toques muito irregulares: tente de novo',
  };
}

// Toca os cliques (com o volume dado) e espera os toques na área `alvo`.
// Termina quando o último clique passou; devolve uma Promise com o resultado de avaliarToques.
export function calibrarToque(ctx, bateria, alvo, volume = 1) {
  return new Promise((resolver) => {
    const intervalo = 60 / BPM;
    const t0 = ctx.currentTime + 0.6;
    const cliques = Array.from({ length: CLIQUES }, (_, i) => t0 + i * intervalo);
    const fim = cliques[CLIQUES - 1] + 0.5;
    const toques = [];

    bateria.definirVolumeClique(volume);
    for (const c of cliques) bateria.clique(c, false);

    // o instante do toque é o relógio do áudio, lido dentro do próprio toque
    const aoTocar = () => { toques.push(ctx.currentTime); };
    alvo.addEventListener('pointerdown', aoTocar);

    // espera o fim pelo relógio do áudio (quadro a quadro), não por tempo de parede
    function quadro() {
      if (ctx.currentTime < fim) { requestAnimationFrame(quadro); return; }
      alvo.removeEventListener('pointerdown', aoTocar);
      resolver(avaliarToques(cliques, filtrarRebote(toques)));
    }
    requestAnimationFrame(quadro);
  });
}
