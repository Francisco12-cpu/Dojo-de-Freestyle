// que-tempo.js — modo 2 "Que tempo foi?" (ESPECIFICACAO 7.1). Só o clique. Um círculo pisca em um
// tempo sorteado a cada compasso; o usuário responde 1, 2, 3 ou 4. 10 perguntas. Nota = % certas.
import { estrelas } from '../pontuacao.js';
import { mulberry32 } from '../rodada.js';

const PERGUNTAS = 10;
const PASSOS_POR_TEMPO = 4;
let desligar = [];

function iniciar(c) {
  const semente = Math.floor(Math.random() * 1e6) + 1;
  const rng = mulberry32(semente);
  const certas = Array.from({ length: PERGUNTAS }, () => 1 + Math.floor(rng() * 4)); // tempos 1 a 4
  const respostas = new Array(PERGUNTAS).fill(null);
  const latencia = c.ctx.outputLatency || c.ctx.baseLatency || 0;

  c.motor.tocarBeat(null);
  c.area.rotulo('PERGUNTA');
  c.area.texto('Qual tempo piscou?');
  c.area.respostas(true, (n) => responder(n));
  c.ativar();

  // Pergunta q (0 a 9) é o compasso q+1 do relógio. Pisca o tempo sorteado.
  let agendado = false;
  desligar.push(c.motor.aoPasso(({ compasso, passo, tempo }) => {
    // o fim só pode ser calculado depois que o relógio começou (no primeiro passo da contagem)
    if (!agendado && compasso === 0 && passo === 0) {
      agendado = true;
      c.agendarFim(c.relogio.tempoDoPasso(PERGUNTAS + 1, 0), () => finalizar());
    }
    const q = compasso - 1;
    if (q < 0 || q >= PERGUNTAS) return;
    if (passo === 0) {
      c.sinc.agendarVisual(tempo, () => {
        c.circulos.apagarTodos();
        c.area.texto(`Pergunta ${q + 1} de ${PERGUNTAS}`);
      });
    }
    if (passo === (certas[q] - 1) * PASSOS_POR_TEMPO) {
      c.sinc.agendarVisual(tempo, () => c.circulos.acender(certas[q] - 1));
    }
  }));

  // Resposta vale para a pergunta que está tocando agora (pelo relógio de áudio).
  function responder(n) {
    const pos = c.relogio.posicaoEm(c.ctx.currentTime - latencia);
    const q = pos.compasso - 1;
    if (q < 0 || q >= PERGUNTAS || respostas[q] !== null) return;
    respostas[q] = n;
  }

  function finalizar() {
    const acertos = respostas.filter((r, i) => r === certas[i]).length;
    const nota = (acertos / PERGUNTAS) * 100;
    c.finalizar({
      nota,
      estrelas: estrelas(nota),
      erroMedioMs: null,
      viesMs: null,
      detalhes: { acertos, total: PERGUNTAS },
    });
  }
}

function parar() {
  for (const fn of desligar) fn();
  desligar = [];
}

export const modo = { id: 'que-tempo', nome: 'Que tempo foi?', precisaMic: false, precisaVoz: false, iniciar, parar };
