import { useColorScheme } from 'react-native';

const marca = {
  principal: '#0E7A84',
  escura: '#0C646D',
  degradeFim: '#0D5259',
  clara: '#EEF8F8',
};

export type Cores = {
  principal: string;
  principalTexto: string;
  escura: string;
  degradeInicio: string;
  degradeFim: string;
  fundo: string;
  superficie: string;
  destaque: string;
  texto: string;
  textoSecundario: string;
  borda: string;
  sucesso: string;
  sucessoFundo: string;
  alerta: string;
  alertaFundo: string;
  erro: string;
  erroFundo: string;
};

// Os pares de texto e fundo abaixo foram escolhidos com contraste AA (4,5:1).
export const claro: Cores = {
  principal: marca.principal,
  principalTexto: '#FFFFFF',
  escura: marca.escura,
  degradeInicio: marca.principal,
  degradeFim: marca.degradeFim,
  fundo: '#F8FAFC',
  superficie: '#FFFFFF',
  destaque: marca.clara,
  texto: '#0F172A',
  textoSecundario: '#64748B',
  borda: '#E2E8F0',
  sucesso: '#166534',
  sucessoFundo: '#DCFCE7',
  alerta: '#92400E',
  alertaFundo: '#FEF3C7',
  erro: '#B91C1C',
  erroFundo: '#FEE2E2',
};

export const escuro: Cores = {
  principal: '#2BA3AE',
  principalTexto: '#04252A',
  escura: '#5CC2CB',
  degradeInicio: marca.escura,
  degradeFim: '#073A3F',
  fundo: '#0B1220',
  superficie: '#111A2B',
  destaque: '#0F2E33',
  texto: '#F1F5F9',
  textoSecundario: '#A3B1C2',
  borda: '#24324A',
  sucesso: '#86EFAC',
  sucessoFundo: '#14361F',
  alerta: '#FCD34D',
  alertaFundo: '#3A2A08',
  erro: '#FCA5A5',
  erroFundo: '#3D1414',
};

export function useCores(): Cores {
  return useColorScheme() === 'dark' ? escuro : claro;
}

export const raio = { pequeno: 12, medio: 14, grande: 16 } as const;
export const espaco = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;
export const toqueMinimo = 44;
