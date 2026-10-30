import createClient, { type Middleware } from 'openapi-fetch';

import { API_URL } from '@/lib/config';
import { sessaoExpirou, tokenAtual } from '@/auth/token';
import { erroDaResposta, RedeError } from './errors';
import type { paths } from './schema';

const autenticacao: Middleware = {
  onRequest({ request }) {
    const token = tokenAtual();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    return request;
  },
  onResponse({ request, response }) {
    // 401 nas rotas de entrada é "código ou senha errados", não sessão vencida.
    if (response.status === 401 && request.headers.has('Authorization')) sessaoExpirou();
    return response;
  },
};

// fetch lido na hora da chamada (permite trocar nos testes).
export const api = createClient<paths>({ baseUrl: API_URL, fetch: (r) => globalThis.fetch(r) });
api.use(autenticacao);

type Resultado<T> = { data?: T; error?: unknown; response: Response };

/** Faz a chamada e devolve os dados, ou lança ApiError / RedeError. */
export async function pedir<T>(chamada: Promise<Resultado<T>>): Promise<T> {
  let r: Resultado<T>;
  try {
    r = await chamada;
  } catch {
    throw new RedeError();
  }
  if (!r.response.ok || r.error !== undefined) throw erroDaResposta(r.response.status, r.error);
  return r.data as T;
}

/** Cabeçalhos para chamadas fora do openapi-fetch (PDF e envio de arquivo). */
export function cabecalhosAutenticados(): Record<string, string> {
  const token = tokenAtual();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Trata a resposta de um fetch manual: 401 encerra a sessão, erro vira ApiError. */
export async function conferirResposta(response: Response) {
  if (response.ok) return;
  if (response.status === 401 && tokenAtual()) sessaoExpirou();
  let corpo: unknown = null;
  try {
    corpo = await response.json();
  } catch {
    // corpo vazio ou não-JSON: usa a mensagem padrão do status
  }
  throw erroDaResposta(response.status, corpo);
}
