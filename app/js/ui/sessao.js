// sessao.js — a sessão de áudio compartilhada pelas telas (um AudioContext, um relógio, um motor).
// Só é criada dentro de um toque do usuário (ver audio/contexto.js).
import { contextoAudio } from '../audio/contexto.js';
import { criarRelogio } from '../audio/relogio.js';
import { criarBateria } from '../audio/bateria.js';
import { criarMotor } from '../audio/motor.js';
import { criarSincronia } from './sincronia.js';

let sessao = null;

export function garantirSessao() {
  if (sessao) return sessao;
  const ctx = contextoAudio();
  const relogio = criarRelogio(ctx);
  const bateria = criarBateria(ctx);
  const motor = criarMotor({ ctx, relogio, bateria });
  sessao = { ctx, relogio, bateria, motor, sinc: criarSincronia(ctx) };
  return sessao;
}

// Sem criar nada: devolve a sessão se já existir (para parar sem abrir áudio).
export const sessaoAtual = () => sessao;
