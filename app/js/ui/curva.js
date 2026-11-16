// curva.js — a curva do beat (docs/ESPECIFICACAO.md, seção 9.2, item 4).
// y(p) = amplitude(p) · (1 + cos(2π·p/4)) / 2. Picos nos passos 0, 4, 8 e 12.
// As funções de cálculo são puras (testadas em testes/curva.test.mjs).
import { cor } from './cores.js';

const picoAmp = (k) => (k % 2 === 1 ? 1 : 0.6); // tempos 2 e 4 (caixa) = 1; tempos 1 e 3 = 0,6

// Amplitude suave entre dois picos vizinhos (interpolação em cosseno).
export function amplitude(p) {
  const k = Math.floor(p / 4);
  const f = p / 4 - k;
  const s = (1 - Math.cos(Math.PI * f)) / 2;
  return picoAmp(k) * (1 - s) + picoAmp(k + 1) * s;
}

export const valorCurva = (p) => amplitude(p) * (1 + Math.cos((2 * Math.PI * p) / 4)) / 2;

export function criarCurva(canvas) {
  const g = canvas.getContext('2d');

  function ajustar() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { W, H };
  }

  // pos: passo contínuo (0 a 16) onde está a música agora; desenha o cursor amarelo.
  function desenhar(pos = 0) {
    const { W, H } = ajustar();
    const m = 14, base = H - 22, alt = base - 14;
    const x = (p) => m + (p / 16) * (W - 2 * m);
    const y = (v) => base - v * alt;

    g.clearRect(0, 0, W, H);
    g.strokeStyle = cor('--linha');
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(m, base); g.lineTo(W - m, base); g.stroke();

    // segunda caixa (passo 12): marcador tracejado na cor da caixa
    g.strokeStyle = cor('--caixa');
    g.setLineDash([4, 4]);
    g.beginPath(); g.moveTo(x(12), 10); g.lineTo(x(12), base); g.stroke();
    g.setLineDash([]);

    // a curva, branca
    g.strokeStyle = cor('--texto');
    g.lineWidth = 3;
    g.beginPath();
    for (let i = 0; i <= 320; i++) {
      const q = i / 20;
      if (i) g.lineTo(x(q), y(valorCurva(q))); else g.moveTo(x(q), y(valorCurva(q)));
    }
    g.stroke();
    g.lineWidth = 1;

    // picos numerados: 1 e 3 em azul (bumbo), 2 e 4 em laranja (caixa)
    g.font = '700 13px system-ui';
    g.textAlign = 'center';
    [0, 4, 8, 12].forEach((p, i) => {
      g.fillStyle = i % 2 === 1 ? cor('--caixa') : cor('--bumbo');
      g.beginPath(); g.arc(x(p), y(valorCurva(p)), 4, 0, 2 * Math.PI); g.fill();
      g.fillText(String(i + 1), x(p), y(valorCurva(p)) - 8);
    });

    // cursor: linha vertical amarela na posição atual
    g.strokeStyle = cor('--aviso');
    g.beginPath(); g.moveTo(x(pos), 10); g.lineTo(x(pos), base); g.stroke();
  }

  return { desenhar };
}
