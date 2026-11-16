// grade.js — grade de 16 casas no canvas (docs/ESPECIFICACAO.md, 9.2 item 5).
// Linha de cima: bumbo (azul) e caixa (laranja) do compasso atual.
// Linha de baixo: a voz (um traço por sílaba). Linha vertical amarela = posição atual.
import { eventosDoCompasso } from '../audio/gerador.js';
import { cor } from './cores.js';

const PASSOS = 16;

export function criarGrade(canvas) {
  const g = canvas.getContext('2d');
  let topo = [];   // [{ passo, instrumento }]
  let voz = [];    // [{ passo, cor }]
  let pos = null;  // passo contínuo atual, ou null (sem cursor)

  function desenhar() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);

    const m = 14, larg = (W - 2 * m) / PASSOS;
    const xCentro = (p) => m + p * larg + larg / 2;
    const yTopo = H * 0.3, yVoz = H * 0.75;

    // casas: as dos 4 tempos (passos 0, 4, 8, 12) mais claras
    for (let p = 0; p < PASSOS; p++) {
      g.fillStyle = p % 4 === 0 ? cor('--painel') : cor('--painel-2');
      g.fillRect(m + p * larg + 1, 8, larg - 2, H - 16);
    }

    // linha de cima: bumbo (círculo azul) e caixa (retângulo laranja)
    for (const e of topo) {
      const x = xCentro(e.passo);
      if (e.instrumento === 'bumbo') {
        g.fillStyle = cor('--bumbo');
        g.beginPath(); g.arc(x, yTopo, larg * 0.28, 0, 2 * Math.PI); g.fill();
      } else {
        g.fillStyle = cor('--caixa');
        g.fillRect(x - larg * 0.28, yTopo - larg * 0.28, larg * 0.56, larg * 0.56);
      }
    }

    // linha de baixo: a voz, um traço por sílaba na posição exata
    g.lineWidth = 3;
    for (const s of voz) {
      g.strokeStyle = s.cor;
      const x = xCentro(s.passo);
      g.beginPath(); g.moveTo(x, yVoz - 12); g.lineTo(x, yVoz + 12); g.stroke();
    }

    // cursor
    if (pos !== null) {
      g.lineWidth = 2;
      g.strokeStyle = cor('--aviso');
      const x = m + pos * larg;
      g.beginPath(); g.moveTo(x, 8); g.lineTo(x, H - 8); g.stroke();
    }
  }

  return {
    // Mostra bumbo e caixa do compasso `beatN` (0 a 31) do beat.
    desenharBeat(beat, beatN) {
      topo = eventosDoCompasso(beat, beatN)
        .filter((e) => e.instrumento === 'bumbo' || e.instrumento === 'caixa')
        .map((e) => ({ passo: e.passo, instrumento: e.instrumento }));
      desenhar();
    },
    definirPosicao(passoContinuo) {
      pos = passoContinuo === null ? null : passoContinuo % PASSOS;
      desenhar();
    },
    limparVoz() { voz = []; desenhar(); },
    adicionarSilaba(passo, corTraco) { voz.push({ passo, cor: corTraco }); desenhar(); },
  };
}
