import * as SecureStore from 'expo-secure-store';

// O token da sessão só existe aqui (memória) e no Keychain/Keystore.
// Nunca vai para AsyncStorage, log ou relatório de erro.
const CHAVE = 'alianca.sessao';

let atual: string | null = null;
let aoExpirar: (() => void) | null = null;

export function tokenAtual() {
  return atual;
}

export async function carregarToken() {
  atual = await SecureStore.getItemAsync(CHAVE);
  return atual;
}

export async function guardarToken(token: string) {
  await SecureStore.setItemAsync(CHAVE, token, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
  atual = token;
}

export async function apagarToken() {
  atual = null;
  await SecureStore.deleteItemAsync(CHAVE);
}

/** A sessão registra aqui o que fazer quando a API responde 401. */
export function quandoSessaoExpirar(fn: (() => void) | null) {
  aoExpirar = fn;
}

export function sessaoExpirou() {
  if (atual === null) return;
  atual = null;
  void SecureStore.deleteItemAsync(CHAVE);
  aoExpirar?.();
}
