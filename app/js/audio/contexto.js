// contexto.js — o AudioContext único do app. Só deve ser chamado dentro de um toque do usuário
// (o Chrome exige gesto para liberar o áudio).
let ctx = null;

export function contextoAudio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}
