// circulos.js — os 4 círculos dos tempos (1, 2, 3, 4). Os tempos 2 e 4 têm a cor da caixa.
// Estilo em css/tokens.css (.tempos, .aceso, .caixa).
export function criarCirculos(elemento) {
  elemento.innerHTML = '';
  const itens = [1, 2, 3, 4].map((numero, i) => {
    const el = document.createElement('i');
    el.textContent = String(numero);
    if (i === 1 || i === 3) el.classList.add('caixa');
    elemento.appendChild(el);
    return el;
  });

  return {
    // tempo: 0 a 3 (tempo 1 a 4)
    acender(tempo) {
      itens.forEach((el, i) => el.classList.toggle('aceso', i === tempo));
    },
    apagarTodos() {
      for (const el of itens) el.classList.remove('aceso');
    },
  };
}
