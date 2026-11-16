// onset-worklet.js — AudioWorkletProcessor que roda o detector na thread de áudio.
// Carregar com: await ctx.audioWorklet.addModule('js/mic/onset-worklet.js')
//
// IMPORTANTE: o nó precisa estar ligado até o destination (passando por um GainNode com
// gain 0), senão alguns navegadores deixam de chamar process(). Ver captura.js.
import { DetectorOnset } from './onset-core.js';

class DetectorOnsetProcessor extends AudioWorkletProcessor {
  constructor(opcoes) {
    super();
    this.det = new DetectorOnset({ ...(opcoes.processorOptions ?? {}), sampleRate }); // `sampleRate` é global do worklet
    this.contador = 0;
    this.port.onmessage = (e) => { if (e.data?.tipo === 'configurar') this.det.configurar(e.data.valores); };
  }

  process(entradas) {
    const x = entradas[0]?.[0];
    if (!x) return true;
    const r = this.det.processar(x, currentTime); // `currentTime` = relógio do AudioContext, o mesmo do beat
    if (r.onset) this.port.postMessage({ tipo: 'onset', tempo: r.onset.tempo, forca: r.onset.forca });
    if (++this.contador % 8 === 0) this.port.postMessage({ tipo: 'nivel', valor: r.nivel });
    return true;
  }
}

registerProcessor('detector-onset', DetectorOnsetProcessor);
