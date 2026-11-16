// exemplos.js — patadas-modelo: pares (frase + resposta) com cada sílaba marcada no passo em que cai.
// Servem para o usuário VER e OUVIR um encaixe certo antes de tentar (visualizador e modo 6).
// Regra de todas: a sílaba tônica da última palavra (t: true) cai no passo 12 (tempo 4).
// Conferidas por testes/exemplos.test.mjs. Não invente novas sem passar no teste.
// Cada sílaba: [texto, passo] ou [texto, passo, true] para a tônica da rima.

export const EXEMPLOS = [
  {
    rima: 'ar',
    linhas: [
      { texto: 'Cheguei no compasso pra rimar', silabas: [['che', 2], ['guei', 4], ['no', 6], ['com', 7], ['pas', 8], ['so', 9], ['pra', 10], ['ri', 11], ['mar', 12, true]] },
      { texto: 'No quatro a rima vai entrar', silabas: [['no', 2], ['qua', 4], ['tro', 5], ['a', 6], ['ri', 8], ['ma', 9], ['vai', 10], ['en', 11], ['trar', 12, true]] },
    ],
  },
  {
    rima: 'ada',
    linhas: [
      { texto: 'A caixa avisa na virada', silabas: [['a', 2], ['cai', 4], ['xa', 5], ['a', 6], ['vi', 8], ['sa', 9], ['na', 10], ['vi', 11], ['ra', 12, true], ['da', 14]] },
      { texto: 'Sigo contando, não perco nada', silabas: [['si', 2], ['go', 3], ['con', 4], ['tan', 6], ['do', 7], ['não', 8], ['per', 10], ['co', 11], ['na', 12, true], ['da', 14]] },
    ],
  },
  {
    rima: 'ão',
    linhas: [
      { texto: 'Respira fundo e solta a canção', silabas: [['res', 2], ['pi', 4], ['ra', 5], ['fun', 6], ['do e', 7], ['sol', 8], ['ta a', 10], ['can', 11], ['ção', 12, true]] },
      { texto: 'Quem conta os tempos não perde o chão', silabas: [['quem', 2], ['con', 4], ['ta os', 5], ['tem', 6], ['pos', 7], ['não', 8], ['per', 10], ['de o', 11], ['chão', 12, true]] },
    ],
  },
  {
    rima: 'ente',
    linhas: [
      { texto: 'Palavra forte sempre na frente', silabas: [['pa', 2], ['la', 4], ['vra', 5], ['for', 6], ['te', 7], ['sem', 8], ['pre', 9], ['na', 10], ['fren', 12, true], ['te', 14]] },
      { texto: 'No tempo quatro encaixa a gente', silabas: [['no', 3], ['tem', 4], ['po', 5], ['qua', 6], ['tro en', 7], ['cai', 8], ['xa a', 10], ['gen', 12, true], ['te', 14]] },
    ],
  },
];
