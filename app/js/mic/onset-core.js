// onset-core.js — detector de início de sílaba. PURO: processa blocos de amostras (Float32Array)
// e diz quando começou uma sílaba. Roda dentro do AudioWorklet (onset-worklet.js) e no Node (testes).
//
// Ideia: uma sílaba nova é uma SUBIDA rápida de volume (em dB), não um volume alto. Comparar com
// uma média lenta (versão v1 do plano) perdia 58% das sílabas na fala rápida; medir a subida
// numa janela de 30 ms acerta ≥ 98% na fala normal, sem falsos positivos (testes/onset.test.mjs).
import { CONFIG } from '../config.js';

export class DetectorOnset {
  // opc: qualquer campo de CONFIG.onset, mais sampleRate (padrão 48000) e blocoAmostras (padrão 128)
  constructor(opc = {}) {
    this.sampleRate = opc.sampleRate ?? 48000;
    this.bloco = opc.blocoAmostras ?? 128;
    this.configurar({ ...CONFIG.onset, ...opc });
    this.reiniciar();
  }

  configurar(c) {
    for (const k of ['piso', 'alphaRapido', 'janelaS', 'subidaDb', 'quedaDb', 'refratarioS']) if (c[k] !== undefined) this[k] = c[k];
    const m = Math.max(2, Math.round((this.janelaS * this.sampleRate) / this.bloco));
    if (m !== this.M) { this.M = m; this.hist = new Array(m).fill(-120); this.k = 0; }
  }

  reiniciar() {
    this.rapido = 0;
    this.M = undefined; this.configurar({});
    this.ultimo = -Infinity; this.armado = true; this.pico = -120;
  }

  // amostras: Float32Array de 1 bloco. tempo: instante (segundos) do INÍCIO do bloco.
  // Devolve { onset: {tempo, forca} | null, nivel: volume suavizado }.
  processar(amostras, tempo) {
    let soma = 0;
    for (let i = 0; i < amostras.length; i++) soma += amostras[i] * amostras[i];
    const rms = Math.sqrt(soma / amostras.length);
    this.rapido += (rms - this.rapido) * this.alphaRapido;
    const db = 20 * Math.log10(this.rapido + 1e-6);
    this.hist[this.k++ % this.M] = db;
    let base = Infinity;
    for (let i = 0; i < this.M; i++) if (this.hist[i] < base) base = this.hist[i];

    let onset = null;
    if (this.armado) {
      if (this.rapido > this.piso && db - base >= this.subidaDb && tempo - this.ultimo > this.refratarioS) {
        onset = { tempo, forca: this.rapido };
        this.ultimo = tempo; this.armado = false; this.pico = db;
      }
    } else {
      if (db > this.pico) this.pico = db;
      if (db < this.pico - this.quedaDb) this.armado = true; // o volume já caiu: pronto para a próxima sílaba
    }
    return { onset, nivel: this.rapido };
  }
}

// Piso de volume a partir do ruído de fundo medido em ~1 s de silêncio (média do `nivel`).
export function pisoParaRuido(rmsRuido) {
  const { ruidoFator, pisoMin, pisoMax } = CONFIG.onset;
  return Math.min(pisoMax, Math.max(pisoMin, rmsRuido * ruidoFator));
}
