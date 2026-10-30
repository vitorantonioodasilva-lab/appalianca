import { api, pedir } from '@/api/client';
import { digitos } from './formato';

export const ESPERA_REENVIO = 60;
export const MAXIMO_ERROS = 5;

/** Pede o código de 6 números pelo WhatsApp. Usado também pelo "Reenviar". */
export async function pedirCodigo(cpf: string) {
  return pedir(api.POST('/entrar', { body: { cpf: digitos(cpf) } }));
}
