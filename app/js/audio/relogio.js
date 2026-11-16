// relogio.js — agendador do beat. Usa o relógio do AudioContext (ctx.currentTime) como
// ÚNICA fonte de tempo. Um setInterval só "acorda" para agendar os próximos passos;
// quem decide o instante exato é o áudio.
import { CONFIG } from '../config.js';
import { criarLinhaDoTempo, duracaoPasso, PASSOS } from './tempo.js';

export function criarRelogio(ctx, opc = {}) {
  const { intervaloMs, antecedenciaS, inicioFolgaS } = { ...CONFIG.agendador, ...opc };
  let linha = null, timer = null, swing = 0, bpmPendente = null;
  let proxCompasso = 0, proxPasso = 0;
  const ouvintes = new Set();

  // O swing atrasa só os passos ímpares; a grade de pontuação (posicaoEm) ignora o swing.
  function tempoAgendado(n, p) {
    const t = linha.tempoDoPasso(n, p);
    return p % 2 === 1 ? t + swing * duracaoPasso(linha.bpmDoCompasso(n)) : t;
  }

  function agendar() {
    const limite = ctx.currentTime + antecedenciaS;
    for (;;) {
      // o BPM novo só vale a partir do início do próximo compasso a ser criado
      while (linha.ultimo().n < proxCompasso) {
        linha.agendarProximoCompasso(bpmPendente ?? undefined);
        bpmPendente = null;
      }
      const t = tempoAgendado(proxCompasso, proxPasso);
      if (t > limite) break;
      const info = { compasso: proxCompasso, passo: proxPasso, tempo: t };
      for (const fn of ouvintes) fn(info);
      if (++proxPasso === PASSOS) { proxPasso = 0; proxCompasso++; }
    }
  }

  return {
    iniciar(bpm) {
      this.parar();
      linha = criarLinhaDoTempo(ctx.currentTime + inicioFolgaS, bpm);
      proxCompasso = 0; proxPasso = 0; bpmPendente = null;
      timer = setInterval(agendar, intervaloMs);
      agendar();
    },
    parar() { if (timer !== null) { clearInterval(timer); timer = null; } },
    definirBpm(bpm) { bpmPendente = bpm; },          // vale a partir do próximo compasso
    definirSwing(v) { swing = Math.min(0.2, Math.max(0, v)); },
    // fn({ compasso, passo, tempo }) é chamada na hora de AGENDAR (um pouco antes de tocar)
    aoPasso(fn) { ouvintes.add(fn); return () => ouvintes.delete(fn); },
    posicaoEm: (t) => linha.posicaoEm(t),
    tempoDoPasso: (n, p) => linha.tempoDoPasso(n, p),
    bpmDoCompasso: (n) => linha.bpmDoCompasso(n),
    get ativo() { return timer !== null; },
  };
}
