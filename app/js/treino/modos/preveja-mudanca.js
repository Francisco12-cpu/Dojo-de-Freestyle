// preveja-mudanca.js — modo 3 "Preveja a mudança" (ESPECIFICACAO 7.1). 6 mudanças de seção por rodada;
// nas 2 primeiras o contador de compassos aparece; depois some. O toque acerta se estiver a até
// 1 tempo do início da seção nova. Toque fora disso é erro e não desconta os outros alvos.
import { gerarBeat, secaoDoCompasso } from '../../audio/gerador.js';
import { estrelas } from '../pontuacao.js';
import { avaliarAlvos, acertoDaMudanca, duracaoTempoMs } from '../rodada.js';

const MUDANCAS = 6;
const COM_CONTADOR = 2;
let desligar = [];

function iniciar(c) {
  const semente = Math.floor(Math.random() * 1e6) + 1;
  const beat = gerarBeat({ estilo: 'boombap', bpm: c.bpm, semente });
  c.motor.tocarBeat(beat);
  c.area.rotulo('ESCUTA');
  c.area.texto('Toque no tempo 1 em que a seção nova começa.');
  c.area.respostas(false);

  // índices de compasso do beat (0 a 31, repetindo) onde uma seção nova começa, sem contar o início
  const mudancas = [];
  for (let b = 1; mudancas.length < MUDANCAS; b++) {
    if (secaoDoCompasso(beat, b).compassoNaSecao === 0) mudancas.push(b);
  }
  let alvos = null;
  let preparado = false;

  desligar.push(c.motor.aoCompasso(({ compasso, beatN, tempo }) => {
    if (!preparado && compasso === 0) {
      preparado = true;
      // alvos = início de cada seção nova, no relógio (compasso do relógio = beatN + 1)
      alvos = mudancas.map((b) => c.relogio.tempoDoPasso(b + 1, 0));
      c.agendarFim(c.relogio.tempoDoPasso(mudancas[MUDANCAS - 1] + 2, 0), () => finalizar());
      c.ativar();
    }
    if (compasso < 1) return;
    // contador só para as 2 primeiras mudanças
    const i = mudancas.findIndex((b) => b >= beatN);
    c.sinc.agendarVisual(tempo, () => {
      if (i >= 0 && i < COM_CONTADOR) {
        const falta = mudancas[i] - beatN;
        c.area.texto(falta === 0 ? 'Mudança agora' : `Muda em ${falta} compasso${falta === 1 ? '' : 's'}`);
      } else {
        c.area.texto('Toque no tempo 1 em que a seção nova começa.');
      }
    });
  }));

  function finalizar() {
    const tempoMs = duracaoTempoMs(c.bpm);
    const r = avaliarAlvos(c.toquesDaRodada(), alvos, { toqueMs: c.toqueMs, maxMs: tempoMs });
    const acertos = r.errosMs.filter((e) => acertoDaMudanca(e, tempoMs)).length;
    const nota = (acertos / MUDANCAS) * 100;
    const media = r.errosMs.length ? r.errosMs.reduce((s, e) => s + Math.abs(e), 0) / r.errosMs.length : null;
    c.finalizar({
      nota,
      estrelas: estrelas(nota),
      erroMedioMs: media === null ? null : Math.round(media),
      viesMs: null,
      detalhes: { acertos, mudancas: MUDANCAS, toquesFora: r.extras },
    });
  }
}

function parar() {
  for (const fn of desligar) fn();
  desligar = [];
}

export const modo = { id: 'preveja-mudanca', nome: 'Preveja a mudança', precisaMic: false, precisaVoz: false, iniciar, parar };
