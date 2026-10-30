import type { Resumo } from '@/api/types';
import { linkWhatsapp } from './formato';

// O OpenAPI ainda não descreve o WhatsApp dos associados no /resumo.
// Lemos os nomes de campo mais prováveis; sem nenhum, o botão não aparece
// (nunca escrevemos número no código).
type ComContatos = {
  contatos?: { whatsapp?: unknown; whatsappAssociados?: unknown; whatsappLink?: unknown } | null;
};

export function whatsappDaAlianca(resumo: Resumo | undefined, mensagem?: string): string | null {
  const c = (resumo as (Resumo & ComContatos) | undefined)?.contatos;
  if (!c) return null;
  if (typeof c.whatsappLink === 'string' && c.whatsappLink.startsWith('http')) {
    return mensagem ? `${c.whatsappLink}${c.whatsappLink.includes('?') ? '&' : '?'}text=${encodeURIComponent(mensagem)}` : c.whatsappLink;
  }
  const numero = [c.whatsappAssociados, c.whatsapp].find((v): v is string => typeof v === 'string' && v.length >= 10);
  return numero ? linkWhatsapp(numero, mensagem) : null;
}
