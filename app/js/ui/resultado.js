// resultado.js — tela Resultado: estrelas, nota, o número principal e os botões Repetir e Próximo.
const $ = (id) => document.getElementById(id);
let ultimo = null;

// viesMs negativo = adiantado (a spec usa esse sinal)
function tendencia(viesMs) {
  if (viesMs === null || viesMs === undefined) return '';
  if (Math.abs(viesMs) <= 10) return 'em cima do tempo';
  return viesMs < 0 ? 'adiantado' : 'atrasado';
}

// info: { modo, nome, bpm, nota, estrelas, erroMedioMs, viesMs, detalhes }
export function mostrarResultado(info) {
  ultimo = info;
  $('res-nome').textContent = `${info.nome} · ${info.bpm} BPM`;
  $('res-estrelas').textContent = '★'.repeat(info.estrelas) + '☆'.repeat(3 - info.estrelas);
  $('res-nota').textContent = `Nota ${Math.round(info.nota)} de 100`;

  let principal = '';
  if (info.erroMedioMs !== null && info.erroMedioMs !== undefined) {
    const t = tendencia(info.viesMs);
    principal = `erro médio ${info.erroMedioMs} ms${t ? `, tendência: ${t}` : ''}`;
  } else if (info.detalhes?.acertos !== undefined && info.detalhes?.total !== undefined) {
    principal = `${info.detalhes.acertos} de ${info.detalhes.total} certas`;
  }
  $('res-principal').textContent = principal;

  const d = info.detalhes ?? {};
  $('res-detalhe').textContent = Object.entries(d)
    .filter(([, v]) => typeof v === 'number')
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}

export function iniciarResultadoUi({ repetir, proximo }) {
  $('res-repetir').addEventListener('click', () => { if (ultimo) repetir(ultimo.modo); });
  $('res-proximo').addEventListener('click', () => { if (ultimo) proximo(ultimo.modo); });
}
