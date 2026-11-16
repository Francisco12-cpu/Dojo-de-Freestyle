// sincronia.js — a tela muda no instante em que o SOM sai, não quando o som é agendado.
// Um único requestAnimationFrame lê o relógio do áudio e roda o que já "tocou".
// Eventos mais velhos que DESCARTE_S (aba travada, por exemplo) são descartados sem desenhar.
const DESCARTE_S = 0.5;

export function criarSincronia(ctx) {
  let fila = [];
  let rodando = false;

  const latencia = () => ctx.outputLatency || ctx.baseLatency || 0;

  function quadro() {
    const agora = ctx.currentTime - latencia();
    while (fila.length && fila[0].t <= agora) {
      const ev = fila.shift();
      if (agora - ev.t <= DESCARTE_S) ev.fn();
    }
    if (fila.length) requestAnimationFrame(quadro);
    else rodando = false;
  }

  return {
    // t: instante de ÁUDIO em que o som sai. fn: o que desenhar.
    agendarVisual(t, fn) {
      fila.push({ t, fn });
      fila.sort((a, b) => a.t - b.t);
      if (!rodando) {
        rodando = true;
        requestAnimationFrame(quadro);
      }
    },
    limpar() { fila = []; },
  };
}
