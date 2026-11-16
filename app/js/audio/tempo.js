// tempo.js — matemática do tempo. NÃO usa AudioContext: roda igual no navegador e no Node.
// "Passo" = 1/16 de compasso. 16 passos por compasso; passos 0,4,8,12 = tempos 1,2,3,4.

export const PASSOS = 16;
export const duracaoPasso = (bpm) => 60 / bpm / 4;      // segundos
export const duracaoCompasso = (bpm) => 240 / bpm;      // segundos

// Linha do tempo: lembra em que instante de áudio cada compasso começou e com que BPM.
// Assim posicaoEm() e tempoDoPasso() continuam certos mesmo depois de trocar o BPM.
export function criarLinhaDoTempo(inicio, bpm) {
  const comp = [{ n: 0, inicio, bpm }];
  const ultimo = () => comp[comp.length - 1];

  // Cria o próximo compasso, começando exatamente quando o anterior termina.
  function agendarProximoCompasso(bpmNovo) {
    const u = ultimo();
    const novo = { n: u.n + 1, inicio: u.inicio + duracaoCompasso(u.bpm), bpm: bpmNovo ?? u.bpm };
    comp.push(novo);
    return novo;
  }

  function acharPorTempo(t) {
    for (let i = comp.length - 1; i >= 0; i--) if (comp[i].inicio <= t) return comp[i];
    return null;
  }

  // Posição contínua em um instante t (segundos do relógio de áudio).
  // Devolve { compasso, passo } com passo em [0,16), ex.: 11.6. Antes do início, compasso < 0.
  function posicaoEm(t) {
    const c = acharPorTempo(t) ?? comp[0];
    const bruto = (t - c.inicio) / duracaoPasso(c.bpm);
    const k = Math.floor(bruto / PASSOS); // só ≠ 0 antes do início ou depois do último compasso criado
    return { compasso: c.n + k, passo: bruto - k * PASSOS };
  }

  // Instante (segundos) de um passo. O passo pode ser fracionário (ex.: 12.5).
  function tempoDoPasso(n, passo) {
    const p0 = comp[0], u = ultimo();
    let inicio, bpm;
    if (n < p0.n) { bpm = p0.bpm; inicio = p0.inicio + (n - p0.n) * duracaoCompasso(bpm); }
    else if (n > u.n) { bpm = u.bpm; inicio = u.inicio + (n - u.n) * duracaoCompasso(bpm); }
    else { const c = comp[n - p0.n]; bpm = c.bpm; inicio = c.inicio; }
    return inicio + passo * duracaoPasso(bpm);
  }

  const bpmDoCompasso = (n) => {
    const p0 = comp[0], u = ultimo();
    return n <= p0.n ? p0.bpm : n >= u.n ? u.bpm : comp[n - p0.n].bpm;
  };

  return { agendarProximoCompasso, posicaoEm, tempoDoPasso, bpmDoCompasso, ultimo, compassos: comp };
}
