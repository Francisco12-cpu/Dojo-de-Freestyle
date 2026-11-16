// calibrar.js — calibração do toque, na tela Ajustes (ESPECIFICACAO 4.4, rotina 3).
// Toca 12 cliques a 90 BPM; o usuário toca na área a cada clique. Grava calibracao.toqueMs.
import { calibrarToque } from '../mic/calibracao.js';
import { estado, alterarEstado } from '../dados/estado.js';
import { garantirSessao } from './sessao.js';

const $ = (id) => document.getElementById(id);

function mostrarAtual() {
  const c = estado().calibracao;
  $('aj-cal-atual').textContent = c.toqueMs
    ? `Atraso do toque: ${c.toqueMs} ms (calibrado em ${c.data || 'data desconhecida'})`
    : 'Ainda não calibrado: o toque não é corrigido.';
}

export function iniciarCalibracaoUi() {
  mostrarAtual();
  $('aj-calibrar').addEventListener('click', async () => {
    const s = garantirSessao(); // primeiro toque: libera o áudio
    $('aj-cal-msg').textContent = 'Ouça os cliques e toque na área a cada um.';
    $('aj-calibrar').disabled = true;
    $('aj-cal-area').hidden = false;
    const r = await calibrarToque(s.ctx, s.bateria, $('aj-cal-area'), 1);
    $('aj-cal-area').hidden = true;
    $('aj-calibrar').disabled = false;
    s.bateria.definirVolumeClique(estado().ajustes.volClique);
    if (r.ok) {
      const data = new Date().toISOString().slice(0, 10);
      alterarEstado((d) => { d.calibracao = { ...d.calibracao, toqueMs: r.toqueMs, metodo: 'toque', data }; });
      $('aj-cal-msg').textContent = `Calibrado: ${r.toqueMs} ms (desvio ${r.desvioMs} ms, ${r.pares} toques).`;
    } else {
      $('aj-cal-msg').textContent = `Não valeu: ${r.motivo}. Tente de novo.`;
    }
    mostrarAtual();
  });
}
