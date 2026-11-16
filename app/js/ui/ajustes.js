// ajustes.js — tela Ajustes (Fase 0): estilo, volumes, BPM travado, BPM sentido ÷2, vibração,
// exportar e importar. Cada mudança é gravada na hora.
import { CONFIG } from '../config.js';
import { exportar, importar } from '../dados/armazenamento.js';
import { estado, alterarEstado, substituirEstado } from '../dados/estado.js';

const $ = (id) => document.getElementById(id);
let dadosPendentes = null; // importação aguardando confirmação

function mostrarValores() {
  const a = estado().ajustes;
  $('aj-estilo').value = a.estilo;
  $('aj-volBeat').value = a.volBeat;
  $('aj-volBeat-valor').textContent = Number(a.volBeat).toFixed(2);
  $('aj-volClique').value = a.volClique;
  $('aj-volClique-valor').textContent = Number(a.volClique).toFixed(2);
  $('aj-bpmTravado').value = a.bpmTravado ?? '';
  $('aj-bpmSentido').checked = !!a.bpmSentidoMetade;
  $('aj-vibrar').checked = !!a.vibrar;
}

function mensagem(texto) {
  $('aj-msg').textContent = texto;
}

// Volume: número entre 0 e 1 (o slider já garante; aqui só converte).
function ligarVolume(id, campo) {
  $(id).addEventListener('input', () => {
    const v = Number($(id).value);
    alterarEstado((d) => { d.ajustes[campo] = v; });
    $(id + '-valor').textContent = v.toFixed(2);
  });
}

function ligarBpmTravado() {
  $('aj-bpmTravado').addEventListener('change', () => {
    const txt = $('aj-bpmTravado').value.trim();
    if (txt === '') {
      alterarEstado((d) => { d.ajustes.bpmTravado = null; });
      mensagem('BPM livre');
      return;
    }
    const n = Math.round(Number(txt));
    const { bpmMin, bpmMax } = CONFIG.treino;
    if (!Number.isFinite(n) || n < bpmMin || n > bpmMax) {
      mensagem(`Use um número entre ${bpmMin} e ${bpmMax}, ou deixe vazio.`);
      $('aj-bpmTravado').value = estado().ajustes.bpmTravado ?? '';
      return;
    }
    alterarEstado((d) => { d.ajustes.bpmTravado = n; });
    $('aj-bpmTravado').value = n;
    mensagem(`BPM travado em ${n} BPM`);
  });
}

function exportarArquivo() {
  const texto = exportar(estado());
  const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `dojo-freestyle-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function escolherArquivo(arquivo) {
  if (!arquivo) return;
  const r = importar(await arquivo.text());
  if (!r.ok) {
    dadosPendentes = null;
    $('aj-confirma').hidden = true;
    mensagem(`Importação cancelada: ${r.erro}.`);
    return;
  }
  dadosPendentes = r.dados;
  const n = r.dados.historico.length;
  $('aj-confirma-resumo').textContent =
    `Arquivo com ${n} rodada${n === 1 ? '' : 's'} no histórico e faixa ${r.dados.faixa}. ` +
    'Os dados atuais serão substituídos.';
  $('aj-confirma').hidden = false;
}

function ligarImportacao() {
  $('aj-arquivo').addEventListener('change', (e) => {
    escolherArquivo(e.target.files[0]);
    e.target.value = ''; // permite escolher o mesmo arquivo de novo
  });
  $('aj-confirmar').addEventListener('click', () => {
    if (!dadosPendentes) return;
    substituirEstado(dadosPendentes);
    dadosPendentes = null;
    $('aj-confirma').hidden = true;
    mostrarValores();
    mensagem('Dados importados.');
  });
  $('aj-cancelar').addEventListener('click', () => {
    dadosPendentes = null;
    $('aj-confirma').hidden = true;
    mensagem('Importação cancelada.');
  });
}

export function iniciarAjustes() {
  mostrarValores();
  $('aj-estilo').addEventListener('change', (e) => {
    alterarEstado((d) => { d.ajustes.estilo = e.target.value; });
  });
  ligarVolume('aj-volBeat', 'volBeat');
  ligarVolume('aj-volClique', 'volClique');
  ligarBpmTravado();
  $('aj-bpmSentido').addEventListener('change', (e) => {
    alterarEstado((d) => { d.ajustes.bpmSentidoMetade = e.target.checked; });
  });
  $('aj-vibrar').addEventListener('change', (e) => {
    alterarEstado((d) => { d.ajustes.vibrar = e.target.checked; });
  });
  $('aj-exportar').addEventListener('click', exportarArquivo);
  ligarImportacao();
}
