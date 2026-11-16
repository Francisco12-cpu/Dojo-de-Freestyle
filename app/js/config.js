// config.js — TODOS os números ajustáveis do app ficam aqui. Nenhum outro arquivo
// deve ter limiar, peso ou tempo "solto" no código. Para ajustar o app depois de
// testar com voz real, só se muda este arquivo.

export const CONFIG = {
  PASSOS: 16, // passos por compasso (semicolcheias). Passos 0, 4, 8 e 12 = tempos 1, 2, 3 e 4.

  agendador: {
    intervaloMs: 25,   // de quanto em quanto tempo o relógio acorda
    antecedenciaS: 0.12, // quanto à frente ele agenda os sons
    inicioFolgaS: 0.15,  // folga entre apertar "começar" e o primeiro passo
  },

  // Detector de início de sílaba (mic/onset-core.js). Valores validados só com fala
  // sintética: AJUSTAR com voz real na tela Laboratório.
  onset: {
    piso: 0.015,       // volume mínimo (RMS 0..1). A calibração troca por 3x o ruído de fundo.
    pisoMin: 0.008,
    pisoMax: 0.05,
    ruidoFator: 3,
    alphaRapido: 0.35, // suavização do envelope rápido (por bloco de 128 amostras)
    janelaS: 0.03,     // janela para medir a subida
    subidaDb: 5,       // subida mínima em dB dentro da janela para contar uma sílaba
    quedaDb: 3,        // queda em dB desde o pico para "rearmar" o detector
    refratarioS: 0.09, // tempo mínimo entre duas sílabas (limita a ~11 sílabas por segundo)
  },

  pontuacao: {
    pesos: { fecho: 0.35, grade: 0.40, densidade: 0.10, respiro: 0.15 }, // calibrados por simulação (testes/pontuacao.test.mjs): aleatório fica < 50, bom > 85
    fecho: {
      ultimas: 2,        // sem saber a palavra, só os 2 últimos sons podem ser "a rima" (oxítona ou paroxítona, ~95% das palavras)
      cravouPassos: 0.5, // até 0,5 passo do tempo 4 = 100 pontos
      pertoPassos: 1.0,  // até 1 passo = ptsPerto
      ptsPerto: 60,
    },
    grade: {
      oitavas:       { tol: 0.4,  acaso: 0.4 }, // cai perto de um passo par; 40% é o que o acaso daria
      semicolcheias: { tol: 0.25, acaso: 0.5 }, // cai perto de qualquer passo; 50% é o acaso
      otimo: 0.85,       // fração de acertos que vale 100 pontos
    },
    densidade: { faixaIdeal: [5, 10], faixaAvancada: [6, 12], penalidadePorSilaba: 15 },
    respiro: { gapCheio: 1.5, gapZero: 0.5 }, // passos livres no fim do compasso
    estrelas: [85, 65, 40], // 3, 2 e 1 estrela
    toque: { acertoMs: 70, quaseMs: 130 },
  },

  feedback: {
    foraTempoFecho: 0.5,  // fração de compassos com fecho 0 que dispara a dica de rima
    ultimoTarde: 14.5,    // último som depois disso = rima tarde
    ultimoCedo: 11.5,     // último som antes disso = rima cedo
    viesMs: 60,           // adiantado/atrasado médio acima disso gera dica
    viesCalibracaoMs: 120, // 3 rodadas seguidas acima disso = recalibrar
    respiroBaixo: 50,
    notaBoa: 85,
  },

  treino: {
    bpmInicial: 80, bpmMin: 66, bpmMax: 110, passoBpm: 4,
    notaSobe: 85, notaDesce: 50,
  },
};
