import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api } from '@/api/client';
import { apagarCarteirinhaGuardada } from '@/lib/carteirinhaOffline';
import { apagarToken, carregarToken, guardarToken, quandoSessaoExpirar } from './token';

type Estado = 'carregando' | 'dentro' | 'fora';

type Sessao = {
  estado: Estado;
  entrar: (token: string) => Promise<void>;
  sair: () => Promise<void>;
};

const Contexto = createContext<Sessao | null>(null);

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>('carregando');
  const queryClient = useQueryClient();

  const limpar = useCallback(async () => {
    queryClient.clear();
    await apagarCarteirinhaGuardada();
    setEstado('fora');
  }, [queryClient]);

  useEffect(() => {
    carregarToken()
      .then((t) => setEstado(t ? 'dentro' : 'fora'))
      .catch(() => setEstado('fora'));
  }, []);

  useEffect(() => {
    // Qualquer 401 com sessão: o token já foi apagado, volta para a entrada.
    quandoSessaoExpirar(() => void limpar());
    return () => quandoSessaoExpirar(null);
  }, [limpar]);

  const entrar = useCallback(async (token: string) => {
    await guardarToken(token);
    setEstado('dentro');
  }, []);

  const sair = useCallback(async () => {
    try {
      await api.POST('/sair');
    } catch {
      // sem internet: a sessão vence sozinha no servidor; apagamos daqui mesmo assim
    }
    await apagarToken();
    await limpar();
  }, [limpar]);

  const valor = useMemo(() => ({ estado, entrar, sair }), [estado, entrar, sair]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSessao() {
  const s = useContext(Contexto);
  if (!s) throw new Error('useSessao fora do SessaoProvider');
  return s;
}
