// treino.js — tela Treino. Modos: Metrônomo, Beat livre (teste) e os 4 modos de toque (Fase 3).
// O AudioContext só nasce no primeiro toque em Começar.
import { CONFIG } from '../config.js';
import { estado, alterarEstado } from '../dados/estado.js';
import { garantirSessao, sessaoAtual } from './sessao.js';
import { criarCirculos } from './circulos.js';
import { registrarBeatLivre, iniciarBeatLivre, pararBeatLivre, iniciarBeatLivreUi, desenharBeatLivreParado } from './beat-livre.js';
import { mostrarResultado, iniciarResultadoUi } from './resultado.js';
import { aoEntrar, ir, telaAtual } from './telas.js';
import { criarContextoModo } from '../treino/contextoModo.js';
import { MODOS_TOQUE } from '../treino/modos/catalogo.js';

const $ = (id) => document.getElementById(id);
const { bpmMin, bpmMax, bpmInicial, passoBpm } = CONFIG.treino;
const hoje = () => new Date().toISOString().slice(0, 10);
const ehToque = (m) => Object.prototype.hasOwnProperty.call(MODOS_TOQUE, m);
const IDS_TOQUE = Object.keys(MODOS_TOQUE);

let modo = 'metronomo';   // 'metronomo' | 'beat' | id de MODOS_TOQUE
let bpmMetro = bpmInicial;
let rodando = false;
let travaTela = null;     // Wake Lock: a tela não apaga durante o treino
let circulos = null;
let registrado = false;
let rodada = null;        // { id, modoObj, contexto } do modo de toque em execução
let respostaFn = null;    // botões 1 a 4 do modo "Que tempo foi?"

// Área da tela que os modos de toque usam.
const area = {
  rotulo(t) {
    const el = $('modo-rotulo');
    el.textContent = t;
    el.className = 'rotulo-vez ' + (t === 'ESCUTA' ? 'escuta' : 'fala');
  },
  texto(t) { $('modo-texto').textContent = t; },
  respostas(on, fn) { $('modo-respostas').hidden = !on; respostaFn = on ? fn : null; },
};

function modoPadrao(d, id) {
  return { bpm: bpmInicial, boasSeguidas: 0, ruinsSeguidas: 0, melhorNota: 0, ...(d.modos[id] ?? {}) };
}
const bpmDoModo = (id) => modoPadrao(estado(), id).bpm;

// Metrônomo: na hora de agendar, marca os círculos e a contagem para o instante do som.
function registrarMetronomo(s) {
  s.motor.aoPasso(({ compasso, passo, tempo }) => {
    if (modo !== 'metronomo' || passo % 4 !== 0) return;
    const k = passo / 4;
    s.sinc.agendarVisual(tempo, () => {
      if (compasso === 0) { // contagem 4-3-2-1
        $('tr-contador').textContent = String(4 - k);
        circulos.apagarTodos();
      } else {
        $('tr-contador').textContent = `Compasso ${compasso}`;
        circulos.acender(k);
      }
    });
  });
}

function garantir() {
  const s = garantirSessao();
  if (!registrado) {
    registrarMetronomo(s);
    registrarBeatLivre(s);
    registrado = true;
  }
  return s;
}

const bpmAtual = () => (ehToque(modo) ? bpmDoModo(modo) : bpmMetro);

function mostrarBpm() {
  $('tr-bpm').textContent = `${bpmAtual()} BPM`;
}

function mostrarVolume() {
  const v = estado().ajustes.volClique;
  $('tr-volClique').value = v;
  $('tr-volClique-valor').textContent = Number(v).toFixed(2);
  $('tr-aviso-volume').textContent = v === 0 ? 'O volume do clique está em 0. Suba o controle para ouvir.' : '';
}

function mostrarLatencia() {
  const s = sessaoAtual();
  if (!s) { $('tr-latencia').textContent = 'Toque em Começar para medir a latência.'; return; }
  const ms = (x) => Math.round((x || 0) * 1000);
  $('tr-latencia').textContent = `Latência: saída ${ms(s.ctx.outputLatency)} ms · base ${ms(s.ctx.baseLatency)} ms`;
}

async function travarTelaAcesa() {
  try { travaTela = await navigator.wakeLock.request('screen'); } catch { travaTela = null; }
}

function soltarTela() {
  try { travaTela?.release(); } catch { /* sem efeito */ }
  travaTela = null;
}

// Modo de toque: monta o contexto (sessão, área, fim da rodada) e deixa o modo montar a rodada.
function iniciarToque(s) {
  const id = modo;
  const ajustes = estado().ajustes;
  s.bateria.definirVolumeBeat(ajustes.volBeat);
  const contexto = criarContextoModo({
    sessao: s,
    bpm: bpmDoModo(id),
    toqueMs: estado().calibracao.toqueMs,
    faixa: estado().faixa,
    area,
    circulos,
    aoFinalizar: (res) => concluir(id, res),
  });
  rodada = { id, modoObj: MODOS_TOQUE[id], contexto };
  rodada.modoObj.iniciar(contexto);
  s.motor.iniciar(contexto.bpm);
}

function iniciar() {
  const s = garantir();
  s.bateria.definirVolumeClique(estado().ajustes.volClique);
  if (modo === 'beat') {
    iniciarBeatLivre(s);
  } else if (ehToque(modo)) {
    iniciarToque(s);
  } else {
    s.motor.tocarBeat(null);
    s.motor.iniciar(bpmMetro);
  }
  rodando = true;
  $('tr-pausado').hidden = true;
  $('tr-iniciar').textContent = 'Parar';
  mostrarVolume();
  mostrarLatencia();
  travarTelaAcesa();
}

function parar() {
  const s = sessaoAtual();
  if (!s) return;
  s.motor.parar();
  s.sinc.limpar();
  circulos.apagarTodos();
  pararBeatLivre();
  if (rodada) { rodada.modoObj.parar(); rodada = null; }
  respostaFn = null;
  rodando = false;
  $('tr-iniciar').textContent = 'Começar';
  $('tr-contador').textContent = 'Pronto';
  soltarTela();
}

function pausar(texto) {
  parar();
  $('tr-pausado').textContent = texto;
  $('tr-pausado').hidden = false;
}

// Fim de uma rodada de modo de toque: guarda no histórico e mostra o Resultado.
function concluir(id, res) {
  const bpm = rodada?.contexto.bpm ?? bpmDoModo(id);
  parar();
  const nota = Math.round(res.nota);
  alterarEstado((d) => {
    d.historico.push({
      data: hoje(), modo: id, bpm, nota,
      fecho: null, grade: null, densidade: null, respiro: null,
      viesMs: res.viesMs ?? null, erroMedioMs: res.erroMedioMs ?? null,
      silabas: null, rima: null,
    });
    const m = modoPadrao(d, id);
    d.modos[id] = { ...m, bpm, melhorNota: Math.max(m.melhorNota ?? 0, nota) };
  });
  mostrarResultado({ modo: id, nome: MODOS_TOQUE[id].nome, bpm, ...res });
  ir('resultado');
}

function mudarBpm(delta) {
  if (ehToque(modo)) {
    if (rodando) return; // o BPM do modo muda entre as rodadas
    const novo = Math.min(bpmMax, Math.max(bpmMin, bpmDoModo(modo) + delta));
    alterarEstado((d) => { d.modos[modo] = { ...modoPadrao(d, modo), bpm: novo }; });
    mostrarBpm();
    return;
  }
  bpmMetro = Math.min(bpmMax, Math.max(bpmMin, bpmMetro + delta));
  mostrarBpm();
  if (rodando && modo === 'metronomo') sessaoAtual().motor.definirBpm(bpmMetro); // próximo compasso
}

function mostrarBlocos() {
  $('bloco-metronomo').hidden = modo !== 'metronomo';
  $('bloco-bpm').hidden = modo === 'beat';
  $('bloco-beat').hidden = modo !== 'beat';
  $('bloco-toque').hidden = !ehToque(modo);
  $('tr-titulo').textContent = modo === 'metronomo' ? 'Metrônomo'
    : modo === 'beat' ? 'Beat livre (teste)' : MODOS_TOQUE[modo]?.nome ?? '';
}

function trocarModo(novo) {
  if (rodando) parar();
  modo = novo;
  $('tr-modo').value = novo;
  mostrarBlocos();
  mostrarBpm();
  $('tr-contador').textContent = 'Pronto';
  $('tr-aviso-muda').hidden = true;
  $('modo-rotulo').textContent = '';
  $('modo-texto').textContent = '';
  $('modo-respostas').hidden = true;
  if (modo === 'beat') desenharBeatLivreParado();
}

// Próximo modo de toque na ordem da spec (usado pelo botão Próximo do Resultado).
function proximoToque(id) {
  const i = IDS_TOQUE.indexOf(id);
  return IDS_TOQUE[(i + 1) % IDS_TOQUE.length];
}

// Abre a tela Treino já no modo pedido (usado pela tela Modos e pelo Resultado).
export function abrirModo(id) {
  trocarModo(id);
  ir('treino');
}

export function iniciarTreino() {
  circulos = criarCirculos($('tr-tempos'));
  iniciarBeatLivreUi();
  iniciarResultadoUi({ repetir: abrirModo, proximo: (id) => abrirModo(proximoToque(id)) });
  mostrarVolume();
  mostrarLatencia();

  $('tr-modo').addEventListener('change', (e) => trocarModo(e.target.value));
  $('tr-iniciar').addEventListener('click', () => (rodando ? parar() : iniciar()));
  $('tr-m4').addEventListener('click', () => mudarBpm(-passoBpm));
  $('tr-m1').addEventListener('click', () => mudarBpm(-1));
  $('tr-p1').addEventListener('click', () => mudarBpm(1));
  $('tr-p4').addEventListener('click', () => mudarBpm(passoBpm));

  // botão grande de toque: o instante é o relógio do áudio, lido dentro do toque
  $('modo-toque').addEventListener('pointerdown', () => {
    if (rodada) rodada.contexto.registrarToque(sessaoAtual().ctx.currentTime);
  });
  for (const b of document.querySelectorAll('#modo-respostas button')) {
    b.addEventListener('click', () => respostaFn?.(Number(b.dataset.n)));
  }

  $('tr-volClique').addEventListener('input', (e) => {
    const v = Number(e.target.value);
    alterarEstado((d) => { d.ajustes.volClique = v; });
    sessaoAtual()?.bateria.definirVolumeClique(v);
    mostrarVolume();
  });

  // Sair do app (aba escondida) pausa: o navegador atrasa o agendador em segundo plano.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && rodando) pausar('Pausado: o app saiu da tela. Toque em Começar.');
  });

  // Sair da tela Treino para outra para o treino.
  window.addEventListener('hashchange', () => {
    if (telaAtual() !== 'treino' && rodando) parar();
  });

  aoEntrar('treino', () => { mostrarVolume(); mostrarLatencia(); mostrarBpm(); desenharBeatLivreParado(); });
  trocarModo(modo);
}
