// bateria.js — sons sintetizados (nenhum arquivo de áudio). Cada som liga um nó no instante
// `tempo` e o desliga em `tempo + duração`, para nada ficar tocando depois do som.
// Receitas: docs/ESPECIFICACAO.md, seção 3.2.

const FIM_ENVELOPE = 0.001; // o ganho cai até aqui (a curva exponencial não aceita zero)
const hz = (nota) => 440 * Math.pow(2, (nota - 69) / 12); // nota MIDI -> frequência

export function criarBateria(ctx) {
  // instrumentos -> ganhoBeat -> compressor -> destino. O clique tem ganho próprio.
  const compressor = ctx.createDynamicsCompressor();
  compressor.connect(ctx.destination);
  const ganhoBeat = ctx.createGain();
  ganhoBeat.connect(compressor);
  const ganhoClique = ctx.createGain();
  ganhoClique.connect(ctx.destination);
  let volBeat = 1; // volume normal do beat (usado ao entrar ou sair do silêncio)

  // Ruído branco: um buffer de 1 s, criado uma vez e reutilizado.
  const ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const amostras = ruido.getChannelData(0);
  for (let i = 0; i < amostras.length; i++) amostras[i] = Math.random() * 2 - 1;

  // Ganho v0 em t, caindo exponencialmente até FIM_ENVELOPE em t + d. Devolve o nó já ligado ao destino.
  function envelope(destino, t, v0, d) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(v0, t);
    g.gain.exponentialRampToValueAtTime(FIM_ENVELOPE, t + d);
    g.connect(destino);
    return g;
  }

  function ruidoFiltrado(tipoFiltro, freq, t, v0, d) {
    const fonte = ctx.createBufferSource();
    fonte.buffer = ruido;
    const filtro = ctx.createBiquadFilter();
    filtro.type = tipoFiltro;
    filtro.frequency.value = freq;
    fonte.connect(filtro);
    filtro.connect(envelope(ganhoBeat, t, v0, d));
    fonte.start(t);
    fonte.stop(t + d + 0.01);
  }

  function bumbo(t, vol) {
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    o.connect(envelope(ganhoBeat, t, vol, 0.35));
    o.start(t);
    o.stop(t + 0.36);
  }

  function caixa(t, vol) {
    ruidoFiltrado('highpass', 1200, t, 0.8 * vol, 0.18);
    const tri = ctx.createOscillator();
    tri.type = 'triangle';
    tri.frequency.value = 190;
    tri.connect(envelope(ganhoBeat, t, 0.5 * vol, 0.1));
    tri.start(t);
    tri.stop(t + 0.11);
  }

  // rolo: número de toques dentro do passo; toque i em t + i * passoS / rolo.
  function chimbal(t, vol, { aberto = false, rolo = 0, passoS = 0 }) {
    const toques = rolo > 1 ? rolo : 1;
    const espaco = rolo > 1 ? passoS / rolo : 0;
    const duracao = aberto ? 0.25 : Math.min(0.05, espaco || 0.05);
    for (let i = 0; i < toques; i++) ruidoFiltrado('highpass', 7000, t + i * espaco, 0.3 * vol, duracao);
  }

  function baixo(t, vol, nota, passoS) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = hz(nota);
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 400;
    o.connect(filtro);
    filtro.connect(envelope(ganhoBeat, t, 0.5 * vol, 2 * passoS));
    o.start(t);
    o.stop(t + 2 * passoS + 0.01);
  }

  // Tônica, terça menor (+3) e quinta (+7), triângulos; ganho total 0,12; dura 1 compasso (16 passos).
  function acorde(t, vol, nota, passoS) {
    const dur = 16 * passoS;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 1200;
    filtro.connect(envelope(ganhoBeat, t, 0.12 * vol, dur));
    for (const soma of [0, 3, 7]) {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = hz(nota + soma);
      o.connect(filtro);
      o.start(t);
      o.stop(t + dur + 0.01);
    }
  }

  return {
    saida: compressor,

    // instrumento: 'bumbo' | 'caixa' | 'chimbal' | 'baixo' | 'acorde'
    // opc: { volume, nota, aberto, rolo, passoS }
    tocar(instrumento, tempo, opc = {}) {
      const vol = opc.volume ?? 1;
      switch (instrumento) {
        case 'bumbo': return bumbo(tempo, vol);
        case 'caixa': return caixa(tempo, vol);
        case 'chimbal': return chimbal(tempo, vol, opc);
        case 'baixo': return baixo(tempo, vol, opc.nota, opc.passoS);
        case 'acorde': return acorde(tempo, vol, opc.nota, opc.passoS);
        default: throw new Error(`instrumento desconhecido: ${instrumento}`);
      }
    },

    // Clique: 1.500 Hz no tempo 1 (forte), 1.000 Hz nos outros; 0,03 s.
    clique(tempo, forte) {
      const o = ctx.createOscillator();
      o.frequency.value = forte ? 1500 : 1000;
      o.connect(envelope(ganhoClique, tempo, 1, 0.03));
      o.start(tempo);
      o.stop(tempo + 0.03);
    },

    definirVolumeBeat(v) { volBeat = v; ganhoBeat.gain.value = v; },
    definirVolumeClique(v) { ganhoClique.gain.value = v; },

    // Muda o beat no instante `t` (agendado no áudio): mudo ou no volume normal.
    silenciarBeat(t, mudo) { ganhoBeat.gain.setValueAtTime(mudo ? 0 : volBeat, t); },

    // Beat entra no instante `t`, subindo do silêncio ao volume normal em `duracao` segundos.
    entrarBeat(t, duracao) {
      ganhoBeat.gain.setValueAtTime(0, t);
      ganhoBeat.gain.linearRampToValueAtTime(volBeat, t + duracao);
    },
  };
}
