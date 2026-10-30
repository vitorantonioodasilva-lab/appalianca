import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, Linking } from 'react-native';

/** WhatsApp, telefone e links externos (abre o app certo do aparelho). */
export async function abrirLink(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Não deu para abrir', 'Confira se o aplicativo está instalado e tente de novo.');
  }
}

/** Página do site dentro do navegador do app. */
export async function abrirNoNavegador(url: string) {
  try {
    await WebBrowser.openBrowserAsync(url, { dismissButtonStyle: 'close' });
  } catch {
    await abrirLink(url);
  }
}

/** Copia e mostra "Copiado" no botão por alguns segundos. */
export function useCopiar() {
  const [copiado, setCopiado] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const copiar = useCallback(async (chave: string, texto: string) => {
    await Clipboard.setStringAsync(texto);
    setCopiado(chave);
    AccessibilityInfo.announceForAccessibility('Copiado');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopiado(null), 3000);
  }, []);
  return { copiado, copiar };
}
