import { api, pedir } from '@/api/client';
import { plataforma } from './dispositivo';

/**
 * Fase 2: envia o token de notificação (FCM/APNs) do aparelho.
 * Ainda não é chamado e o app não pede permissão de notificação.
 * Quando ligar: instale expo-notifications, peça a permissão, pegue o
 * token com getDevicePushTokenAsync() e chame esta função depois de entrar.
 */
export async function registrarDispositivo(pushToken: string) {
  return pedir(api.PUT('/dispositivo', { body: { pushToken, plataforma } }));
}
