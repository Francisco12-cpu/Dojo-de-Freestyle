// rima.js — decide se duas palavras rimam em português. Puro (roda no Node e no navegador).
// Duas palavras rimam quando são iguais da VOGAL TÔNICA até o fim.
//
// Limites conhecidos: (1) não separa vogal aberta de fechada (café e você contam como rima);
// (2) hiatos sem acento (juiz, ruim, sair, cair) são lidos como ditongo e falham;
// (3) sotaque muda a rima real. Por isso existe a conferência manual na tela de resultado.

const VOGAIS = new Set([...'aeiouáéíóúâêôãõà']);

export function limpar(texto) {
  return String(texto ?? '').toLowerCase().replace(/[^\p{L}]/gu, '');
}

export function ultimaPalavra(texto) {
  const partes = String(texto ?? '').split(/[^\p{L}]+/u).filter(Boolean);
  return partes.length ? partes[partes.length - 1].toLowerCase() : '';
}

// Núcleos de vogal (um por sílaba), da esquerda para a direita: [{ ini, fim, texto }]
export function nucleos(palavra) {
  const p = limpar(palavra);
  const ehV = [...p].map((c) => VOGAIS.has(c));
  // u depois de q (quase, quando) ou depois de g (guerra, água, língua) é consoante
  for (let i = 1; i < p.length; i++) {
    if (p[i] !== 'u' || !ehV[i]) continue;
    const prev = p[i - 1], prox = p[i + 1];
    if (prev === 'q' && prox && VOGAIS.has(prox)) ehV[i] = false;
    else if (prev === 'g' && prox && VOGAIS.has(prox)) ehV[i] = false;
  }
  const saida = [];
  let i = 0;
  while (i < p.length) {
    if (!ehV[i]) { i++; continue; }
    let j = i + 1;
    const c = p[i], prox = p[i + 1];
    if ((c === 'ã' || c === 'õ') && ehV[i + 1] && (prox === 'o' || prox === 'e' || prox === 'i')) j = i + 2; // ão, ãe, õe
    else if (ehV[i + 1] && (prox === 'i' || prox === 'u')) {
      // ditongo decrescente (ai, ei, oi, ui, au, eu, ou, iu). Exceção: i antes de nh (rainha, moinho)
      if (!(prox === 'i' && p.startsWith('nh', i + 2))) j = i + 2;
    }
    saida.push({ ini: i, fim: j, texto: p.slice(i, j) });
    i = j;
  }
  return saida;
}

// Índice do núcleo tônico, pelas regras de acentuação do português.
export function indiceTonico(palavra, nuc = nucleos(palavra)) {
  const p = limpar(palavra);
  if (nuc.length <= 1) return nuc.length - 1;
  for (let k = 0; k < nuc.length; k++) if (/[áéíóúâêô]/.test(nuc[k].texto)) return k;
  for (let k = 0; k < nuc.length; k++) if (/[ãõ]/.test(nuc[k].texto)) return k;
  if (/(a|e|o|as|es|os|am|em|ens)$/.test(p)) return nuc.length - 2; // paroxítona
  return nuc.length - 1; // oxítona
}

// Quantas sílabas vêm DEPOIS da tônica: 0 = oxítona (amor), 1 = paroxítona (casa), 2 = proparoxítona (música).
// É o valor de `silabasAposTonica` que pontuacao.js espera quando a palavra da rima é conhecida.
export function silabasAposTonica(palavra) {
  const nuc = nucleos(palavra);
  return nuc.length ? nuc.length - 1 - indiceTonico(palavra, nuc) : 0;
}

// Do início da vogal tônica até o fim, sem acentos, com z final trocado por s.
export function chaveRima(palavra) {
  const p = limpar(palavra);
  const nuc = nucleos(p);
  if (!nuc.length) return '';
  const k = indiceTonico(p, nuc);
  return p.slice(nuc[k].ini).normalize('NFD').replace(/\p{M}/gu, '').replace(/z$/, 's');
}

// 'repetida' (mesma palavra) | 'perfeita' (chave igual) | 'toante' (mesmas vogais) | 'nenhuma'
export function tipoRima(a, b) {
  const pa = limpar(a), pb = limpar(b);
  if (!pa || !pb) return 'nenhuma';
  if (pa === pb) return 'repetida';
  const ka = chaveRima(pa), kb = chaveRima(pb);
  if (!ka || !kb) return 'nenhuma';
  if (ka === kb) return 'perfeita';
  const va = ka.replace(/[^aeiou]/g, ''), vb = kb.replace(/[^aeiou]/g, '');
  if (va && va === vb) return 'toante';
  return 'nenhuma';
}

export const rimam = (a, b) => ['perfeita', 'toante'].includes(tipoRima(a, b));
