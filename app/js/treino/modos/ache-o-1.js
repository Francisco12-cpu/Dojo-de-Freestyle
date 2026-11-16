// ache-o-1.js — modo 1 "Ache o 1" (ESPECIFICACAO 7.1). 8 compassos; o beat entra num ponto sorteado
// (subindo em 1 tempo); a grade fica escondida; o usuário toca em todo tempo 1.
import { gerarBeat } from '../../audio/gerador.js';
import { duracaoPasso } from '../../audio/tempo.js';
import { pontuarToque } from '../pontuacao.js';
import { mulberry32, avaliarAlvos, duracaoTempoMs } from '../rodada.js';

const COMPASSOS = 8;
let desligar = [];

function iniciar(c) {
  const semente = Math.floor(Math.random() * 1e6) + 1;
  const rng = mulberry32(semente);
  const beat = gerarBeat({ estilo: 'boombap', bpm: c.bpm, semente });
  // o beat entra no compasso 1 ou 2 (do relógio), em um passo sorteado de 0 a 15
  const entrada = { compasso: 1 + Math.floor(rng() * 2), passo: Math.floor(rng() * 16) };
  const passoS = duracaoPasso(c.bpm);
  let alvos = null;
  let preparado = false;

  c.motor.tocarBeat(beat);
  c.area.rotulo('SUA VEZ');
  c.area.texto('Toque no tempo 1 de cada compasso.');
  c.area.respostas(false);

  desligar.push(c.motor.aoPasso(({ compasso, passo, tempo }) => {
    if (!preparado && compasso === 0 && passo === 0) {
      preparado = true;
      c.bateria.silenciarBeat(tempo, true); // beat mudo até o ponto sorteado
      alvos = [];
      for (let n = entrada.compasso + 1; n <= entrada.compasso + COMPASSOS; n++) {
        alvos.push(c.relogio.tempoDoPasso(n, 0));
      }
      c.agendarFim(c.relogio.tempoDoPasso(entrada.compasso + COMPASSOS + 1, 0), () => finalizar());
      c.ativar();
    }
    if (compasso === entrada.compasso && passo === entrada.passo) {
      c.bateria.entrarBeat(tempo, 4 * passoS); // sobe em 1 tempo
    }
  }));

  function finalizar() {
    const r = avaliarAlvos(c.toquesDaRodada(), alvos, {
      toqueMs: c.toqueMs,
      maxMs: duracaoTempoMs(c.bpm) / 2,
    });
    const p = pontuarToque(r.errosMs, r.perdidos + r.extras);
    c.finalizar({
      nota: p.nota,
      estrelas: p.estrelas,
      erroMedioMs: p.erroMedioAbsMs,
      viesMs: p.viesMs,
      detalhes: { acertos: p.acertos, quase: p.quase, erros: p.erros, total: p.total },
    });
  }
}

function parar() {
  for (const fn of desligar) fn();
  desligar = [];
}

export const modo = { id: 'ache-o-1', nome: 'Ache o 1', precisaMic: false, precisaVoz: false, iniciar, parar };
