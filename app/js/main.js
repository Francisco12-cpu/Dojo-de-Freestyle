// main.js — ponto de entrada: liga as telas, o treino, os modos, o resultado e os ajustes.
import { iniciarTelas } from './ui/telas.js';
import { iniciarAjustes } from './ui/ajustes.js';
import { iniciarCalibracaoUi } from './ui/calibrar.js';
import { iniciarTreino, abrirModo } from './ui/treino.js';
import { iniciarModosUi } from './ui/modos.js';
import { estado } from './dados/estado.js';

function mostrarResumoInicio() {
  const d = estado();
  document.getElementById('inicio-faixa').textContent = String(d.faixa);
  document.getElementById('inicio-seq').textContent = String(d.sequencia.dias);
}

iniciarAjustes();
iniciarCalibracaoUi();
iniciarTreino();
iniciarModosUi(abrirModo);
mostrarResumoInicio();
iniciarTelas();
