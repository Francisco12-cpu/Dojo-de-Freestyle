// beat-fantasma.js — modo 4 "Beat fantasma" (ESPECIFICACAO 7.1). 4 compassos com som, N compassos
// mudos, o som volta; 4 ciclos. O usuário toca nos tempos 2 e 4 também no silêncio.
// Nota = pelo erro médio nos toques durante o silêncio. N depende da faixa (ver silenciosDaFaixa).
import { gerarBeat } from '../../audio/gerador.js';
import { pontuarToque } from '../pontuacao.js';
import { avaliarAlvos, duracaoTempoMs } from '../rodada.js';

const CICLOS = 4;
const COMPASSOS_COM_SOM = 4;
const TEMPO_2 = 4;   // passo do tempo 2
const TEMPO_4 = 12;  // passo do tempo 4
let desligar = [];

// Faixas 1 e 2: 1 compasso mudo; 3 e 4: 2; 5 em diante: 4 (ESPECIFICACAO 7.1, "1, 2 ou 4").
export function silenciosDaFaixa(faixa) {
  if (faixa <= 2) return 1;
  if (faixa <= 4) return 2;
  return 4;
}

function iniciar(c) {
  const semente = Math.floor(Math.random() * 1e6) + 1;
  const beat = gerarBeat({ estilo: 'boombap', bpm: c.bpm, semente });
  const mudos = silenciosDaFaixa(c.faixa);
  const ciclo = COMPASSOS_COM_SOM + mudos;
  const total = CICLOS * ciclo;
  // compasso do relógio n (1 a total): mudo quando cai na parte final do ciclo
  const mudo = (n) => (n - 1) % ciclo >= COMPASSOS_COM_SOM;
  let alvos = null;
  let preparado = false;

  c.motor.tocarBeat(beat);
  c.area.rotulo('SEGURE O PULSO');
  c.area.texto('Toque nos tempos 2 e 4, com ou sem som.');
  c.area.respostas(false);

  desligar.push(c.motor.aoCompasso(({ compasso, tempo }) => {
    if (!preparado && compasso === 0) {
      preparado = true;
      alvos = [];
      for (let n = 1; n <= total; n++) {
        if (!mudo(n)) continue;
        alvos.push(c.relogio.tempoDoPasso(n, TEMPO_2), c.relogio.tempoDoPasso(n, TEMPO_4));
      }
      c.agendarFim(c.relogio.tempoDoPasso(total + 1, 0), () => finalizar());
      c.ativar();
    }
    if (compasso >= 0) c.bateria.silenciarBeat(tempo, compasso >= 1 && compasso <= total && mudo(compasso));
  }));

  function finalizar() {
    const tempoMs = duracaoTempoMs(c.bpm);
    const r = avaliarAlvos(c.toquesDaRodada(), alvos, { toqueMs: c.toqueMs, maxMs: tempoMs / 2 });
    const p = pontuarToque(r.errosMs, r.perdidos + r.extras);
    c.finalizar({
      nota: p.nota,
      estrelas: p.estrelas,
      erroMedioMs: p.erroMedioAbsMs,
      viesMs: p.viesMs,
      detalhes: { acertos: p.acertos, quase: p.quase, erros: p.erros, total: p.total, silenciosos: alvos.length / 2 },
    });
  }
}

function parar() {
  for (const fn of desligar) fn();
  desligar = [];
}

export const modo = { id: 'beat-fantasma', nome: 'Beat fantasma', precisaMic: false, precisaVoz: false, iniciar, parar };
