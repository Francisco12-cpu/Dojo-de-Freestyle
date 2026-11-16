// pontuacao.js — transforma os instantes das sílabas em notas. Funções PURAS (sem DOM,
// sem áudio): recebem posições em passos e devolvem números. Roda igual no Node.
//
// Entrada de metricasCompasso: `ps` = posições das sílabas DENTRO do compasso, em passos
// contínuos de 0 a 16 (ex.: 11.6), já corrigidas pela latência. Passo 12 = tempo 4.
import { CONFIG } from '../config.js';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const media = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
function mediana(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export const duracaoPassoMs = (bpm) => 60000 / bpm / 4;

export function estrelas(nota) {
  const [t3, t2, t1] = CONFIG.pontuacao.estrelas;
  return nota >= t3 ? 3 : nota >= t2 ? 2 : nota >= t1 ? 1 : 0;
}

// Métricas de UM compasso falado.
//  fecho     — a palavra forte da rima caiu no tempo 4 (passo 12)? Só os 2 últimos sons contam (sem a palavra).
//  grade     — as sílabas caem em posições de pulso (passos pares), em vez de aleatórias?
//  densidade — quantidade de sílabas dentro da faixa ideal.
//  respiro   — sobrou espaço no fim do compasso?
// opc.faixaSilabas: [min, max]   opc.grade: 'oitavas' | 'semicolcheias'
export function metricasCompasso(ps, bpm, opc = {}) {
  const cfg = CONFIG.pontuacao;
  const faixa = opc.faixaSilabas ?? cfg.densidade.faixaIdeal;
  const modoGrade = opc.grade ?? 'oitavas';
  const v = ps.filter((p) => p >= 0 && p < CONFIG.PASSOS).sort((a, b) => a - b);
  const n = v.length;
  if (n === 0) {
    return { vazio: true, n: 0, fecho: 0, grade: 0, densidade: 0, respiro: 0, nota: 0, fechoDelta: null, viesMs: null, ultimoP: null };
  }
  const dpMs = duracaoPassoMs(bpm);

  // fecho: a sílaba tônica da última palavra deve cair no passo 12. delta > 0 = depois do tempo 4.
  // Se a palavra é conhecida (modos com palavra-alvo), opc.silabasAposTonica (0, 1 ou 2) diz qual
  // som é o tônico: o (n-1-s)-ésimo. Se não é, vale o mais perto do 12 entre os últimos sons.
  // LIMITE: sem a palavra, uma frase adiantada em ~1,5 a 2,5 passos pode "passar" porque a sílaba
  // final cai perto do 12. O modo 5 (uma palavra por compasso) não tem essa ambiguidade.
  let tonica = null;
  if (opc.silabasAposTonica !== undefined) tonica = v[Math.max(0, n - 1 - opc.silabasAposTonica)];
  else for (const p of v.slice(-cfg.fecho.ultimas)) if (tonica === null || Math.abs(p - 12) < Math.abs(tonica - 12)) tonica = p;
  const fechoDelta = tonica - 12, d = Math.abs(fechoDelta);
  const fecho = d <= cfg.fecho.cravouPassos ? 100 : d <= cfg.fecho.pertoPassos ? cfg.fecho.ptsPerto : 0;

  // grade: fração das sílabas perto de um passo de pulso, descontado o que o acaso daria.
  // viesMs: erro médio (com sinal) de TODAS as sílabas até o pulso mais perto; negativo = adiantado.
  // Quem erra sempre pelo mesmo tanto aparece aqui mesmo sem "acertar" nenhuma.
  const g = cfg.grade[modoGrade];
  let acertos = 0, somaErro = 0;
  for (const p of v) {
    const alvo = modoGrade === 'oitavas' ? Math.round(p / 2) * 2 : Math.round(p);
    const e = p - alvo;
    somaErro += e;
    if (Math.abs(e) <= g.tol) acertos++;
  }
  const grade = clamp((acertos / n - g.acaso) / (cfg.grade.otimo - g.acaso), 0, 1) * 100;
  const viesMs = (somaErro / n) * dpMs;

  // densidade
  const [mn, mx] = faixa;
  const fora = n < mn ? mn - n : n > mx ? n - mx : 0;
  const densidade = clamp(100 - cfg.densidade.penalidadePorSilaba * fora, 0, 100);

  // respiro: passos livres depois da última sílaba
  const ultimoP = v[n - 1], gap = CONFIG.PASSOS - ultimoP;
  const respiro = clamp((gap - cfg.respiro.gapZero) / (cfg.respiro.gapCheio - cfg.respiro.gapZero), 0, 1) * 100;

  const w = cfg.pesos;
  const nota = w.fecho * fecho + w.grade * grade + w.densidade * densidade + w.respiro * respiro;
  return { vazio: false, n, fecho, grade, densidade, respiro, nota, fechoDelta, viesMs, ultimoP };
}

// Nota da rodada = média das notas dos compassos. Compasso em branco conta 0.
export function notaRodada(compassos) {
  const total = compassos.length;
  const falados = compassos.filter((c) => !c.vazio);
  const nota = total ? media(compassos.map((c) => c.nota)) : 0;
  const med = (campo) => media(falados.map((c) => c[campo]));
  const vieses = falados.map((c) => c.viesMs).filter((x) => x !== null);
  const deltas = falados.map((c) => c.fechoDelta).filter((x) => x !== null);
  return {
    nota, estrelas: estrelas(nota), total, falados: falados.length, vazios: total - falados.length,
    medias: { fecho: med('fecho'), grade: med('grade'), densidade: med('densidade'), respiro: med('respiro') },
    fechoForaFrac: falados.length ? falados.filter((c) => c.fecho === 0).length / falados.length : 0,
    fechoDeltaMed: mediana(deltas),
    ultimoPMed: falados.length ? med('ultimoP') : null,
    silabasMed: falados.length ? med('n') : 0,
    viesMsMed: vieses.length ? media(vieses) : null,
  };
}

// Pior métrica da rodada (entre fecho, grade, densidade, respiro) — usada pelo treino do dia.
export function piorMetrica(rodada) {
  const m = rodada.medias;
  return Object.keys(m).reduce((a, b) => (m[b] < m[a] ? b : a));
}

// Modos de toque: erros em ms (toque − alvo, negativo = adiantado) e alvos sem toque.
export function pontuarToque(errosMs, perdidos = 0) {
  const t = CONFIG.pontuacao.toque;
  let acertos = 0, quase = 0, erros = perdidos;
  for (const e of errosMs) {
    const a = Math.abs(e);
    if (a <= t.acertoMs) acertos++; else if (a <= t.quaseMs) quase++; else erros++;
  }
  const total = acertos + quase + erros;
  const nota = total ? ((acertos + 0.5 * quase) / total) * 100 : 0;
  return {
    nota, estrelas: estrelas(nota), acertos, quase, erros, total,
    erroMedioAbsMs: errosMs.length ? media(errosMs.map(Math.abs)) : null,
    viesMs: errosMs.length ? media(errosMs) : null,
  };
}
