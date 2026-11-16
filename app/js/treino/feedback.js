// feedback.js — frases do treinador. Função pura: recebe o resultado de notaRodada() e
// devolve no máximo 2 dicas, na ordem de prioridade abaixo.
import { CONFIG } from '../config.js';

// r: resultado de notaRodada(). ctx (opcional):
//   faixaSilabas   [min, max]  faixa ideal de sílabas usada na rodada
//   viesAbsUltimas [números]   |viés| em ms das últimas rodadas, a atual por último
//   rima           'perfeita' | 'toante' | 'repetida' | 'nenhuma' | 'desconhecida'
// Devolve [{ codigo, texto }]
export function gerarFeedback(r, ctx = {}) {
  const f = CONFIG.feedback;
  const [mnSil, mxSil] = ctx.faixaSilabas ?? CONFIG.pontuacao.densidade.faixaIdeal;
  const out = [];
  const dica = (codigo, texto) => out.push({ codigo, texto });
  const arred = Math.round;

  if (r.vazios > 0) {
    dica('branco', `Teve ${r.vazios} compasso${r.vazios > 1 ? 's' : ''} em branco, e ${r.vazios > 1 ? 'eles contam' : 'ele conta'} zero. Se travar, volte no próximo 1.`);
  }

  const foraFecho = r.falados > 0 && r.fechoForaFrac >= f.foraTempoFecho;
  if (foraFecho) {
    if (r.ultimoPMed > f.ultimoTarde) dica('rima-tarde', 'A rima está chegando depois do 4. Comece a frase mais cedo ou corte 2 sílabas.');
    else if (r.ultimoPMed < f.ultimoCedo) dica('rima-cedo', 'Você terminou antes do 4. Segure a última palavra até a caixa ou acrescente 1 ou 2 sílabas.');
    else dica('rima-fora', 'A palavra forte da rima não está caindo no 4. Conte 1 2 3 4 e coloque ela em cima do 4.');
  }

  const ult = ctx.viesAbsUltimas ?? [];
  const recalibrar = ult.length >= 3 && ult.slice(-3).every((x) => x > f.viesCalibracaoMs);
  if (recalibrar) {
    dica('recalibrar', 'O atraso está igual em tudo. Refaça a calibração nos Ajustes.');
  } else if (r.viesMsMed !== null) {
    if (r.viesMsMed < -f.viesMs) dica('adiantado', `Você está adiantando ${arred(-r.viesMsMed)} ms em média. Espere a batida.`);
    else if (r.viesMsMed > f.viesMs) dica('atrasado', `Você está atrasando ${arred(r.viesMsMed)} ms em média. Comece a falar um pouco antes.`);
  }

  if (r.falados > 0) {
    if (r.silabasMed < mnSil) dica('poucas', `Só ${arred(r.silabasMed)} sílabas por compasso: sobrou espaço. Acrescente palavras.`);
    else if (r.silabasMed > mxSil) dica('muitas', `${arred(r.silabasMed)} sílabas por compasso: você está atropelando. Tire palavras ou baixe 4 BPM.`);
    if (r.medias.respiro < f.respiroBaixo) dica('emendou', 'Você emendou o fim do compasso no começo do próximo. Deixe um espacinho antes do 1.');
  }
  if (ctx.rima === 'nenhuma' || ctx.rima === 'repetida') dica('sem-rima', 'A resposta não rimou com a frase. Pense na palavra final antes de começar a falar.');
  if (r.nota >= f.notaBoa) dica('encaixou', 'Encaixou! O BPM sobe na próxima.');

  if (!out.length) dica('repita', 'Boa. Repita mais uma vez para firmar.');
  return out.slice(0, 2);
}
