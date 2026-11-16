// palavras.js — banco de palavras para os modos "Palavra-alvo" e "Quatro palavras".
// Cada família reúne palavras que rimam entre si. A conferência automática fica em
// testes/palavras.test.mjs: toda palavra precisa ter rima 'perfeita' com a primeira da lista.
// Palavras comuns do dia a dia, sem palavrão e sem nome próprio.
// nivel 1 = faixas branca a verde; níveis 1 e 2 = azul e roxa; níveis 1, 2 e 3 = marrom e preta.

export const FAMILIAS = [
  // ---- nível 1 ----
  { rima: 'ão', nivel: 1, palavras: ['coração', 'irmão', 'canção', 'mão', 'chão', 'verão', 'razão', 'paixão', 'emoção', 'ilusão', 'perdão', 'lição', 'atenção', 'decisão', 'multidão', 'oração', 'missão', 'ação'] },
  { rima: 'ar', nivel: 1, palavras: ['amar', 'falar', 'cantar', 'sonhar', 'voar', 'jogar', 'pular', 'olhar', 'passar', 'chegar', 'ganhar', 'lutar', 'rimar', 'brilhar', 'pensar', 'mar', 'lugar', 'andar'] },
  { rima: 'er', nivel: 1, palavras: ['fazer', 'correr', 'querer', 'viver', 'saber', 'vencer', 'poder', 'crescer', 'comer', 'beber', 'dever', 'esquecer', 'perder', 'entender', 'mulher', 'qualquer'] },
  { rima: 'ir', nivel: 1, palavras: ['sentir', 'partir', 'sorrir', 'seguir', 'ouvir', 'subir', 'cumprir', 'dormir', 'vestir', 'curtir', 'fugir', 'decidir', 'existir', 'resistir', 'descobrir', 'pedir', 'unir', 'agir'] },
  { rima: 'ada', nivel: 1, palavras: ['estrada', 'parada', 'nada', 'jornada', 'risada', 'calçada', 'cada', 'sacada', 'entrada', 'piada', 'namorada', 'caminhada', 'madrugada', 'pancada', 'enxada', 'trovoada'] },
  { rima: 'ado', nivel: 1, palavras: ['lado', 'dado', 'passado', 'cuidado', 'namorado', 'cansado', 'estado', 'soldado', 'machado', 'prado', 'atrasado', 'apaixonado', 'desenhado', 'abraçado', 'sonhado', 'tarado'] },
  { rima: 'ente', nivel: 1, palavras: ['gente', 'mente', 'frente', 'quente', 'presente', 'diferente', 'contente', 'valente', 'semente', 'corrente', 'ausente', 'doente', 'paciente', 'inteligente', 'urgente', 'ardente'] },
  { rima: 'eiro', nivel: 1, palavras: ['primeiro', 'dinheiro', 'brasileiro', 'cheiro', 'parceiro', 'companheiro', 'guerreiro', 'barbeiro', 'cozinheiro', 'mineiro', 'padeiro', 'ligeiro', 'verdadeiro', 'inteiro', 'janeiro', 'terceiro'] },
  { rima: 'or', nivel: 1, palavras: ['amor', 'calor', 'melhor', 'dor', 'valor', 'cor', 'flor', 'suor', 'motor', 'favor', 'senhor', 'doutor', 'sabor', 'rancor', 'tambor', 'maior', 'pior', 'menor', 'ator'] },
  { rima: 'al', nivel: 1, palavras: ['final', 'igual', 'geral', 'real', 'animal', 'normal', 'mental', 'total', 'local', 'natural', 'especial', 'sinal', 'canal', 'jornal', 'carnaval', 'material', 'social', 'ideal', 'musical'] },
  { rima: 'ia', nivel: 1, palavras: ['alegria', 'dia', 'poesia', 'fantasia', 'energia', 'magia', 'melodia', 'harmonia', 'companhia', 'agonia', 'covardia', 'euforia', 'anarquia', 'teoria', 'tirania', 'sinfonia', 'maresia'] },
  { rima: 'inho', nivel: 1, palavras: ['caminho', 'vizinho', 'carinho', 'sozinho', 'amiguinho', 'pouquinho', 'passarinho', 'cachorrinho', 'benzinho', 'filhinho', 'ninho', 'linho', 'moinho', 'vinho', 'espinho', 'bichinho', 'cantinho', 'padrinho'] },
  { rima: 'inha', nivel: 1, palavras: ['rainha', 'galinha', 'minha', 'vizinha', 'cozinha', 'farinha', 'linha', 'sozinha', 'amiguinha', 'mocinha', 'andorinha', 'adivinha', 'sardinha', 'bainha', 'tainha'] },
  { rima: 'ade', nivel: 1, palavras: ['cidade', 'verdade', 'liberdade', 'amizade', 'saudade', 'felicidade', 'vontade', 'realidade', 'humildade', 'maldade', 'bondade', 'capacidade', 'qualidade', 'sociedade', 'igualdade', 'unidade'] },
  // ---- nível 2 ----
  { rima: 'ento', nivel: 2, palavras: ['momento', 'vento', 'lento', 'talento', 'sentimento', 'pensamento', 'cimento', 'alimento', 'movimento', 'sofrimento', 'aumento', 'treinamento', 'argumento', 'monumento', 'instrumento', 'elemento', 'cento'] },
  { rima: 'eira', nivel: 2, palavras: ['maneira', 'brincadeira', 'bandeira', 'primeira', 'ladeira', 'verdadeira', 'fronteira', 'barreira', 'feira', 'mineira', 'cadeira', 'beira', 'brasileira', 'companheira', 'fogueira', 'madeira', 'poeira'] },
  { rima: 'oso', nivel: 2, palavras: ['gostoso', 'perigoso', 'curioso', 'saboroso', 'maravilhoso', 'poderoso', 'cuidadoso', 'orgulhoso', 'corajoso', 'silencioso', 'amoroso', 'ansioso', 'famoso', 'preguiçoso', 'nervoso', 'teimoso', 'charmoso', 'vistoso'] },
  { rima: 'osa', nivel: 2, palavras: ['gostosa', 'perigosa', 'curiosa', 'maravilhosa', 'poderosa', 'cuidadosa', 'orgulhosa', 'preciosa', 'misteriosa', 'rosa', 'prosa', 'formosa', 'carinhosa', 'ansiosa', 'famosa', 'nervosa', 'teimosa', 'esposa', 'mimosa'] },
  { rima: 'agem', nivel: 2, palavras: ['viagem', 'coragem', 'imagem', 'mensagem', 'vantagem', 'paisagem', 'linguagem', 'passagem', 'homenagem', 'personagem', 'miragem', 'garagem', 'plumagem', 'aprendizagem'] },
  { rima: 'ante', nivel: 2, palavras: ['gigante', 'distante', 'instante', 'importante', 'brilhante', 'diamante', 'constante', 'elefante', 'estudante', 'amante', 'restaurante', 'navegante', 'vibrante', 'bastante', 'radiante', 'emocionante', 'interessante'] },
  { rima: 'ança', nivel: 2, palavras: ['esperança', 'criança', 'lembrança', 'mudança', 'confiança', 'dança', 'balança', 'herança', 'vingança', 'segurança', 'aliança', 'semelhança', 'bonança', 'lança', 'andança'] },
  { rima: 'ência', nivel: 2, palavras: ['ciência', 'paciência', 'experiência', 'existência', 'consciência', 'inteligência', 'consistência', 'resistência', 'violência', 'competência', 'influência', 'aparência', 'audiência', 'essência', 'urgência', 'ausência', 'eficiência'] },
  { rima: 'ela', nivel: 2, palavras: ['janela', 'bela', 'vela', 'panela', 'estrela', 'favela', 'aquarela', 'tigela', 'novela', 'capela', 'donzela', 'tela', 'sentinela', 'gazela', 'sela', 'mortadela'] },
  { rima: 'elo', nivel: 2, palavras: ['cabelo', 'castelo', 'elo', 'modelo', 'martelo', 'pesadelo', 'camelo', 'chinelo', 'novelo', 'farelo', 'gelo', 'zelo', 'apelo', 'flagelo', 'pelo', 'duelo', 'caramelo'] },
  { rima: 'ano', nivel: 2, palavras: ['ano', 'plano', 'humano', 'mano', 'oceano', 'engano', 'pano', 'cigano', 'tirano', 'mundano', 'soberano', 'romano', 'arcano', 'vulcano', 'urbano', 'profano', 'insano', 'americano'] },
  { rima: 'ina', nivel: 2, palavras: ['menina', 'rotina', 'vitrina', 'cortina', 'esquina', 'cantina', 'platina', 'doutrina', 'disciplina', 'medicina', 'marina', 'bailarina', 'turbina', 'oficina', 'usina', 'adrenalina', 'campina'] },
  { rima: 'ato', nivel: 2, palavras: ['gato', 'pato', 'rato', 'ato', 'fato', 'prato', 'retrato', 'contato', 'barato', 'sapato', 'mato', 'recato', 'ingrato', 'relato', 'contrato', 'maltrato', 'desacato'] },
  { rima: 'ura', nivel: 2, palavras: ['altura', 'loucura', 'cultura', 'aventura', 'doçura', 'ternura', 'amargura', 'costura', 'pintura', 'textura', 'ventura', 'criatura', 'figura', 'fartura', 'mistura', 'frescura', 'gordura', 'tintura', 'brancura'] },
  // ---- nível 3 ----
  { rima: 'ete', nivel: 3, palavras: ['foguete', 'capacete', 'chiclete', 'canivete', 'banquete', 'alfinete', 'colete', 'sorvete', 'tapete', 'bilhete', 'gabinete', 'disquete', 'croquete', 'cadete', 'minuete', 'soquete', 'tablete'] },
  { rima: 'ote', nivel: 3, palavras: ['pote', 'bote', 'mascote', 'capote', 'calote', 'chicote', 'garrote', 'decote', 'dote', 'lote', 'pilote', 'trote', 'serrote', 'rebote'] },
  { rima: 'ito', nivel: 3, palavras: ['dito', 'bonito', 'aflito', 'escrito', 'esquisito', 'infinito', 'restrito', 'grito', 'mito', 'perito', 'cabrito', 'apito', 'palito', 'delito', 'bendito', 'maldito', 'visito', 'agito', 'medito'] },
  { rima: 'ita', nivel: 3, palavras: ['bonita', 'fita', 'dita', 'escrita', 'aflita', 'favorita', 'visita', 'pita', 'cabrita', 'esquisita', 'infinita', 'maldita', 'bendita', 'restrita', 'perita', 'agita', 'medita', 'recita'] },
  { rima: 'ola', nivel: 3, palavras: ['bola', 'escola', 'cola', 'viola', 'rola', 'gaiola', 'pistola', 'esmola', 'gola', 'tola', 'carambola', 'cartola', 'sacola'] },
  { rima: 'ema', nivel: 3, palavras: ['problema', 'poema', 'tema', 'sistema', 'esquema', 'dilema', 'cinema', 'fonema', 'blasfema', 'algema', 'gema', 'diadema', 'emblema', 'teorema', 'lema', 'trema', 'estratagema'] },
  { rima: 'ama', nivel: 3, palavras: ['cama', 'fama', 'chama', 'drama', 'trama', 'grama', 'programa', 'lama', 'rama', 'dama', 'ama', 'panorama', 'diagrama', 'telegrama', 'melodrama', 'pijama'] },
  { rima: 'uta', nivel: 3, palavras: ['luta', 'fruta', 'gruta', 'bruta', 'minuta', 'disputa', 'permuta', 'labuta', 'escuta', 'chuta', 'discuta', 'reputa', 'computa', 'imputa', 'executa'] },
  { rima: 'im', nivel: 3, palavras: ['assim', 'jardim', 'fim', 'mim', 'sim', 'capim', 'festim', 'jasmim', 'cetim', 'marfim', 'cupim', 'alecrim', 'motim', 'pudim', 'carmim', 'clarim', 'trampolim', 'botequim', 'latim'] },
  { rima: 'ouro', nivel: 3, palavras: ['ouro', 'tesouro', 'besouro', 'louro', 'couro', 'estouro', 'agouro', 'touro', 'mouro', 'vindouro', 'duradouro', 'bebedouro', 'ancoradouro'] },
  { rima: 'ês', nivel: 3, palavras: ['mês', 'três', 'vez', 'fez', 'talvez', 'xadrez', 'português', 'francês', 'inglês', 'japonês', 'chinês', 'burguês', 'cortês', 'rapidez', 'timidez', 'nudez', 'surdez', 'avidez', 'lucidez', 'pequenez'] },
  { rima: 'eu', nivel: 3, palavras: ['céu', 'chapéu', 'véu', 'troféu', 'réu', 'ilhéu', 'museu', 'eu', 'meu', 'seu', 'teu', 'judeu', 'ateu', 'hebreu', 'perdeu', 'comeu', 'bebeu', 'aconteceu', 'venceu', 'esqueceu'] },
];

export const TEMAS = [
  'escola', 'futebol', 'comida', 'dinheiro', 'namoro', 'viagem', 'videogame', 'música', 'praia', 'família',
  'trabalho', 'amizade', 'sono', 'celular', 'internet', 'festa', 'chuva', 'cidade', 'animais', 'tecnologia',
  'carro', 'moto', 'bicicleta', 'noite', 'verão', 'aniversário', 'professor', 'prova', 'sorte', 'fama',
];

// Famílias liberadas para uma faixa (1 a 8) — ver docs/ESPECIFICACAO.md, seção "Progressão".
export function familiasDaFaixa(faixa) {
  const maxNivel = faixa <= 4 ? 1 : faixa <= 6 ? 2 : 3;
  return FAMILIAS.filter((f) => f.nivel <= maxNivel);
}

// Sorteia `qtd` palavras de uma família (sem repetir). `rng` é uma função () => número em [0,1).
export function sortearPalavras(familia, qtd, rng = Math.random) {
  const pool = [...familia.palavras], saida = [];
  while (saida.length < qtd && pool.length) saida.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return saida;
}
