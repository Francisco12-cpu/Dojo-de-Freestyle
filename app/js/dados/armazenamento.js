// armazenamento.js — leitura e gravação dos dados do app (chave 'dojo.v2', seção 10 da spec).
// Puro: recebe o "storage" (localStorage ou um falso, nos testes) como parâmetro.
// Os valores padrão vêm da própria especificação; não são números de ajuste de treino.

export const CHAVE = 'dojo.v2';
export const HISTORICO_MAX = 500; // rodadas guardadas; as mais antigas saem primeiro

const copia = (x) => JSON.parse(JSON.stringify(x));
const ehObjeto = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

export function padrao() {
  return {
    versao: 2,
    calibracao: { micMs: 0, toqueMs: 0, metodo: 'eco', data: '' },
    ajustes: {
      estilo: 'boombap', volBeat: 0.8, volClique: 0, pisoMic: null, subidaDb: 5,
      entradaId: null, modoVoz: 'desligado', bpmTravado: null, bpmSentidoMetade: false, vibrar: true,
    },
    faixa: 1,
    criterios: { seguidas: 0 },
    modos: {},
    historico: [],
    sequencia: { dias: 0, ultimoDia: '' },
    batalhas: [],
    caderno: [],
  };
}

// Preenche os campos que faltam (recursivamente) com o valor de `base`.
// Campos que o dado salvo tem e a base não tem são mantidos.
export function mesclar(salvo, base = padrao()) {
  const saida = copia(base);
  for (const chave of Object.keys(salvo)) {
    const v = salvo[chave];
    if (v === undefined) continue;
    if (ehObjeto(v) && ehObjeto(saida[chave])) saida[chave] = mesclar(v, saida[chave]);
    else saida[chave] = v;
  }
  return saida;
}

export function carregar(storage) {
  let texto = null;
  try { texto = storage?.getItem(CHAVE) ?? null; } catch { return padrao(); }
  if (!texto) return padrao();
  try {
    const salvo = JSON.parse(texto);
    return ehObjeto(salvo) ? mesclar(salvo) : padrao();
  } catch {
    return padrao();
  }
}

// Grava. Corta o histórico em HISTORICO_MAX (mantém os mais recentes). Devolve true se gravou.
export function salvar(storage, dados) {
  if (Array.isArray(dados.historico) && dados.historico.length > HISTORICO_MAX) {
    dados.historico = dados.historico.slice(-HISTORICO_MAX);
  }
  try {
    storage?.setItem(CHAVE, JSON.stringify(dados));
    return true;
  } catch {
    return false; // sem espaço ou storage bloqueado: o app segue com os dados na memória
  }
}

export function exportar(dados) {
  return JSON.stringify(dados, null, 2);
}

export function importar(texto) {
  let obj;
  try { obj = JSON.parse(texto); } catch { return { ok: false, erro: 'o arquivo não é JSON válido' }; }
  if (!ehObjeto(obj) || typeof obj.versao !== 'number') {
    return { ok: false, erro: 'o arquivo não tem o campo "versao" numérico' };
  }
  return { ok: true, dados: mesclar(obj) };
}
