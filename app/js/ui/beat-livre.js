// beat-livre.js — modo "Beat livre (teste)" da Fase 2: estilo, BPM, semente, contador da seção,
// aviso amarelo no último compasso da seção, grade e curva. Usa a sessão de áudio compartilhada.
import { CONFIG } from '../config.js';
import { gerarBeat, secaoDoCompasso } from '../audio/gerador.js';
import { estado } from '../dados/estado.js';
import { criarGrade } from './grade.js';
import { criarCurva } from './curva.js';

const $ = (id) => document.getElementById(id);
const { bpmMin, bpmMax } = CONFIG.treino;

let beat = null;
let semente = 1;
let rodando = false;
let sessaoRef = null;
let grade = null;
let curva = null;

const latenciaDe = (ctx) => ctx.outputLatency || ctx.baseLatency || 0;

// Mostra o compasso `beatN` (0 a 31 dentro do beat): contador, aviso amarelo e seção.
function mostrarCompasso(beatN) {
  const info = secaoDoCompasso(beat, beatN);
  const esconder = $('bl-esconder').checked;
  $('tr-contador').textContent = esconder ? '' : `Compasso ${info.compassoNaSecao + 1} de ${info.tamanho}`;
  $('tr-aviso-muda').hidden = esconder || info.ateMudar !== 1;
  $('bl-secao').textContent = `seção ${info.indice + 1} de ${beat.secoes.length} · ${beat.bpm} BPM`;
  grade.desenharBeat(beat, beatN);
}

function gerarNovo() {
  beat = gerarBeat({ estilo: $('bl-estilo').value, semente });
  $('bl-bpm').value = beat.bpm;
  $('bl-semente').textContent = `Outro beat (nº ${semente})`;
  grade.desenharBeat(beat, 0);
  curva.desenhar(0);
}

// Quadros de grade e curva acompanham o relógio de áudio (não o agendamento).
function quadro() {
  if (!rodando) return;
  const { ctx, relogio } = sessaoRef;
  const p = relogio.posicaoEm(ctx.currentTime - latenciaDe(ctx));
  const passo = p.compasso < 0 ? 0 : p.passo;
  grade.definirPosicao(passo);
  curva.desenhar(passo);
  requestAnimationFrame(quadro);
}

// Liga os avisos de compasso. Chamado uma vez, com a sessão já criada.
export function registrarBeatLivre(s) {
  s.motor.aoCompasso(({ beatN, tempo }) => {
    if (!rodando || beat === null) return;
    s.sinc.agendarVisual(tempo, () => {
      if (beatN < 0) { // compasso de contagem
        $('tr-contador').textContent = 'Contagem';
        $('tr-aviso-muda').hidden = true;
      } else {
        mostrarCompasso(beatN);
      }
    });
  });
}

export function iniciarBeatLivre(s) {
  sessaoRef = s;
  rodando = true;
  s.bateria.definirVolumeBeat(estado().ajustes.volBeat);
  s.motor.tocarBeat(beat);
  s.motor.iniciar(Number($('bl-bpm').value) || beat.bpm);
  requestAnimationFrame(quadro);
}

// Redesenha grade e curva paradas (quando a tela aparece; o canvas só tem tamanho com a tela visível).
export function desenharBeatLivreParado() {
  if (!grade || beat === null || rodando) return;
  grade.desenharBeat(beat, 0);
  curva.desenhar(0);
}

export function pararBeatLivre() {
  rodando = false;
  grade?.definirPosicao(null);
  $('tr-aviso-muda').hidden = true;
}

export function iniciarBeatLivreUi() {
  grade = criarGrade($('bl-grade'));
  curva = criarCurva($('bl-curva'));
  gerarNovo();

  $('bl-estilo').addEventListener('change', () => {
    gerarNovo();
    if (rodando) sessaoRef.motor.tocarBeat(beat);
  });

  $('bl-semente').addEventListener('click', () => {
    semente = Math.floor(Math.random() * 999) + 1;
    gerarNovo();
    if (rodando) sessaoRef.motor.tocarBeat(beat);
  });

  $('bl-bpm').addEventListener('change', (e) => {
    const v = Math.min(bpmMax, Math.max(bpmMin, Math.round(Number(e.target.value)) || beat.bpm));
    e.target.value = v;
    beat.bpm = v;
    if (rodando) sessaoRef.motor.definirBpm(v); // vale a partir do próximo compasso
  });
}
