// contextoModo.js — o que cada modo de toque recebe: a sessão de áudio, a área da tela e o fim da rodada.
// Os toques são guardados com o instante do relógio de áudio; a rodada só os aceita enquanto está ativa.
import { filtrarRebote } from '../mic/calibracao.js';

export function criarContextoModo({ sessao, bpm, toqueMs, faixa, area, circulos, aoFinalizar }) {
  const toques = [];
  let ativa = false;
  let encerrada = false;

  return {
    ctx: sessao.ctx,
    relogio: sessao.relogio,
    motor: sessao.motor,
    bateria: sessao.bateria,
    sinc: sessao.sinc,
    bpm,
    toqueMs,
    faixa,
    area,
    circulos,

    ativar() { ativa = true; },

    // Chamado pela tela, dentro do pointerdown, com ctx.currentTime.
    registrarToque(t) { if (ativa) toques.push(t); },

    // Toques da rodada, sem os rebotes (dois toques em menos de 80 ms).
    toquesDaRodada: () => filtrarRebote(toques),

    // Roda `fn` no instante `t` do relógio de áudio (ex.: o fim da rodada).
    agendarFim(t, fn) { sessao.sinc.agendarVisual(t, fn); },

    // O modo chama isto ao terminar: { nota, estrelas, erroMedioMs, viesMs, detalhes }.
    finalizar(resultado) {
      if (encerrada) return;
      encerrada = true;
      ativa = false;
      aoFinalizar(resultado);
    },
  };
}
