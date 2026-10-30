import { File, Paths } from 'expo-file-system';

import type { CarteirinhaResposta } from '@/api/types';

// Última resposta de GET /carteirinha, para mostrar sem internet.
// Guarda só o que a API devolveu (CPF já vem mascarado); nunca o token.
export type CarteirinhaGuardada = { resposta: CarteirinhaResposta; salvaEm: string };

function arquivo() {
  return new File(Paths.document, 'carteirinha.json');
}

export async function guardarCarteirinha(resposta: CarteirinhaResposta) {
  const dado: CarteirinhaGuardada = { resposta, salvaEm: new Date().toISOString() };
  const f = arquivo();
  if (!f.exists) f.create();
  await f.write(JSON.stringify(dado));
}

export async function lerCarteirinhaGuardada(): Promise<CarteirinhaGuardada | null> {
  try {
    const f = arquivo();
    if (!f.exists) return null;
    return JSON.parse(await f.text()) as CarteirinhaGuardada;
  } catch {
    return null;
  }
}

export async function apagarCarteirinhaGuardada() {
  try {
    const f = arquivo();
    if (f.exists) f.delete();
  } catch {
    // nada para apagar
  }
}
