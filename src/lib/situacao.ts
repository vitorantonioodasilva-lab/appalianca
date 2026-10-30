import type { TomSelo } from '@/components/Selo';
import type { Documento, Veiculo } from '@/api/types';

export function tomDoVeiculo(situacao: Veiculo['situacao']): TomSelo {
  switch (situacao) {
    case 'ATIVO':
      return 'sucesso';
    case 'AGUARDANDO_ATIVACAO':
      return 'alerta';
    case 'SUSPENSO':
    case 'CANCELADO':
      return 'erro';
    default:
      return 'neutro';
  }
}

const textoVeiculo: Record<NonNullable<Veiculo['situacao']>, string> = {
  ATIVO: 'Ativo',
  AGUARDANDO_ATIVACAO: 'Aguardando ativação',
  SUSPENSO: 'Suspenso',
  CANCELADO: 'Cancelado',
};

export function rotuloDoVeiculo(v: Veiculo) {
  return v.situacao ? textoVeiculo[v.situacao] : (v.situacaoTexto ?? '—');
}

export function tomDoDocumento(situacao: Documento['situacao']): TomSelo {
  if (situacao === 'CONFERIDO') return 'sucesso';
  if (situacao === 'RECUSADO') return 'erro';
  return 'neutro';
}

export function tituloDoVeiculo(v: Pick<Veiculo, 'veiculo' | 'placa'>) {
  return [v.veiculo, v.placa].filter(Boolean).join(' · ') || 'Veículo';
}
