import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiError } from '@/api/errors';
import { SessaoProvider, useSessao } from '@/auth/session';
import { useCores } from '@/theme/colors';

void SplashScreen.preventAutoHideAsync();

function criarQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // 401/404 não melhoram tentando de novo; erro de rede tenta mais uma vez.
        retry: (falhas, erro) => !(erro instanceof ApiError && erro.status < 500) && falhas < 1,
      },
    },
  });
}

function Navegacao() {
  const { estado } = useSessao();
  const c = useCores();

  useEffect(() => {
    if (estado !== 'carregando') void SplashScreen.hideAsync();
  }, [estado]);

  if (estado === 'carregando') return null;
  const dentro = estado === 'dentro';

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.fundo } }}>
        <Stack.Protected guard={dentro} redirectTo="/entrar">
          <Stack.Screen name="(abas)" />
          <Stack.Screen name="beneficio" />
          <Stack.Screen name="evento" />
          <Stack.Screen name="documentos" />
          <Stack.Screen name="contratos" />
        </Stack.Protected>
        <Stack.Protected guard={!dentro} redirectTo="/">
          <Stack.Screen name="entrar" />
          <Stack.Screen name="whatsapp" />
          <Stack.Screen name="codigo" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(criarQueryClient);
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessaoProvider>
          <Navegacao />
        </SessaoProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
