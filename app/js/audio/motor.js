// motor.js — liga relógio + gerador + bateria.
// Numeração: o relógio conta o compasso de contagem como 0 (só cliques). O beat começa no
// compasso 1 do relógio, que é o compasso 0 do beat. Por isso beatN = compasso - 1.
import { duracaoPasso } from './tempo.js';
import { eventosDoCompasso } from './gerador.js';

export function criarMotor({ ctx, relogio, bateria }) {
  let beat = null;
  let cacheN = null, cacheEventos = [];
  let desligarRelogio = null;
  const ouvintesPasso = new Set();
  const ouvintesCompasso = new Set();

  // Roda na hora de AGENDAR cada passo (até 0,12 s antes de tocar). Nada pesado aqui.
  function aoAgendar({ compasso, passo, tempo }) {
    const contagem = compasso === 0;
    const beatN = compasso - 1;

    if (beat === null || contagem) {
      if (passo % 4 === 0) bateria.clique(tempo, passo === 0);
    } else {
      if (cacheN !== beatN) { cacheEventos = eventosDoCompasso(beat, beatN); cacheN = beatN; }
      const passoS = duracaoPasso(relogio.bpmDoCompasso(compasso));
      for (const e of cacheEventos) {
        if (e.passo === passo) bateria.tocar(e.instrumento, tempo, { ...e, passoS });
      }
    }

    for (const fn of ouvintesPasso) fn({ compasso, beatN, passo, tempo });
    if (passo === 0) for (const fn of ouvintesCompasso) fn({ compasso, beatN, tempo });
  }

  return {
    // Define o beat a tocar (sem começar). null = só o clique. Vale no próximo iniciar().
    tocarBeat(novo) {
      beat = novo;
      cacheN = null;
      relogio.definirSwing(novo?.swing ?? 0);
    },

    iniciar(bpm) {
      if (!desligarRelogio) desligarRelogio = relogio.aoPasso(aoAgendar);
      relogio.iniciar(bpm);
    },

    parar() {
      relogio.parar();
      if (desligarRelogio) { desligarRelogio(); desligarRelogio = null; }
    },

    // Só vale a partir do próximo compasso.
    definirBpm(bpm) { relogio.definirBpm(bpm); },

    get beatAtual() { return beat; },

    // fn({ compasso, beatN, passo, tempo }) a cada passo agendado; devolve a função para cancelar.
    aoPasso(fn) { ouvintesPasso.add(fn); return () => ouvintesPasso.delete(fn); },
    // fn({ compasso, beatN, tempo }) no início de cada compasso.
    aoCompasso(fn) { ouvintesCompasso.add(fn); return () => ouvintesCompasso.delete(fn); },
  };
}
