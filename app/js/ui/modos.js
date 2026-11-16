// modos.js — tela Modos: os 10 modos da spec. Os 4 de toque estão ativos; os outros, "em breve".
import { CONFIG } from '../config.js';
import { CATALOGO } from '../treino/modos/catalogo.js';
import { estado } from '../dados/estado.js';
import { aoEntrar } from './telas.js';

export function iniciarModosUi(abrirModo) {
  const lista = document.getElementById('modos-lista');

  function desenhar() {
    lista.innerHTML = '';
    const modos = estado().modos;
    for (const m of CATALOGO) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'botao sec';
      el.textContent = m.nome;
      if (m.ativo) {
        const info = modos[m.id] ?? {};
        const sub = document.createElement('small');
        sub.textContent = `${info.bpm ?? CONFIG.treino.bpmInicial} BPM · melhor nota ${info.melhorNota ?? 0}`;
        el.appendChild(sub);
        el.addEventListener('click', () => abrirModo(m.id));
      } else {
        el.textContent = `${m.nome} · em breve`;
        el.disabled = true;
        el.classList.add('desligado');
      }
      lista.appendChild(el);
    }
  }

  aoEntrar('modos', desenhar);
  desenhar();
}
