import { useQuery } from '@tanstack/react-query';

import { api, pedir } from '@/api/client';
import { ApiError, RedeError } from '@/api/errors';
import { guardarCarteirinha, lerCarteirinhaGuardada } from './carteirinhaOffline';

export const chaves = {
  resumo: ['resumo'],
  carteirinha: ['carteirinha'],
  cobrancas: ['cobrancas'],
  eventos: ['eventos'],
  documentos: ['documentos'],
  contratos: ['contratos'],
} as const;

export function useResumo() {
  return useQuery({ queryKey: chaves.resumo, queryFn: () => pedir(api.GET('/resumo')) });
}

export function useCobrancas() {
  return useQuery({ queryKey: chaves.cobrancas, queryFn: () => pedir(api.GET('/cobrancas')) });
}

export function useEventos() {
  return useQuery({ queryKey: chaves.eventos, queryFn: () => pedir(api.GET('/eventos')) });
}

export function useDocumentos() {
  return useQuery({ queryKey: chaves.documentos, queryFn: () => pedir(api.GET('/documentos')) });
}

export function useContratos() {
  return useQuery({ queryKey: chaves.contratos, queryFn: () => pedir(api.GET('/contratos')) });
}

/**
 * Carteirinha: busca na API e guarda a resposta. Sem internet (ou servidor fora),
 * mostra a última resposta guardada com a data em que foi conferida.
 */
export async function buscarCarteirinha() {
  try {
    const resposta = await pedir(api.GET('/carteirinha'));
    // Se não der para guardar, a carteirinha aparece mesmo assim (só não fica offline).
    await guardarCarteirinha(resposta).catch(() => undefined);
    return { resposta, offline: false, conferidaEm: new Date().toISOString() };
  } catch (erro) {
    const semRede = erro instanceof RedeError || (erro instanceof ApiError && erro.status >= 500);
    if (!semRede) throw erro;
    const guardada = await lerCarteirinhaGuardada();
    if (!guardada) throw erro;
    return { resposta: guardada.resposta, offline: true, conferidaEm: guardada.salvaEm };
  }
}

export function useCarteirinha() {
  return useQuery({ queryKey: chaves.carteirinha, queryFn: buscarCarteirinha });
}
