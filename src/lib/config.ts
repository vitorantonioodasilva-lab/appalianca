const padrao = 'https://recupreacaodeleadsalianca.vercel.app/api/app/v1';

/** Endereço base da API do app (sem barra no fim). */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || padrao).replace(/\/$/, '');

/** Endereço do site, derivado da API: https://dominio/api/app/v1 → https://dominio */
export const SITE_URL = new URL(API_URL).origin;

export const LINKS = {
  acesso: `${SITE_URL}/associado/acesso`,
  meusDados: `${SITE_URL}/associado/entrar`,
};
