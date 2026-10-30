/** Só os números. */
export function digitos(valor: string) {
  return valor.replace(/\D/g, '');
}

/** Máscara de CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00) enquanto digita. */
export function mascararDocumento(valor: string) {
  const d = digitos(valor).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
  }
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function dvCpf(base: string) {
  let soma = 0;
  for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (base.length + 1 - i);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

function dvCnpj(base: string) {
  const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const soma = base.split('').reduce((t, n, i) => t + Number(n) * (pesos[i] ?? 0), 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

/** Confere os dígitos verificadores de CPF ou CNPJ. */
export function documentoValido(valor: string) {
  const d = digitos(valor);
  if (/^(\d)\1+$/.test(d)) return false;
  if (d.length === 11) {
    return dvCpf(d.slice(0, 9)) === Number(d[9]) && dvCpf(d.slice(0, 10)) === Number(d[10]);
  }
  if (d.length === 14) {
    return dvCnpj(d.slice(0, 12)) === Number(d[12]) && dvCnpj(d.slice(0, 13)) === Number(d[13]);
  }
  return false;
}

const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function dinheiro(valor: number | null | undefined) {
  return typeof valor === 'number' ? reais.format(valor) : '—';
}

/** "2026-03-10" ou ISO completo → "10/03/2026". Datas sem hora não mudam de dia pelo fuso. */
export function data(valor: string | null | undefined) {
  if (!valor) return '—';
  const so = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (so) return `${so[3]}/${so[2]}/${so[1]}`;
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

export function dataHora(valor: string | null | undefined) {
  if (!valor) return '—';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export function percentual(valor: number | null | undefined) {
  return typeof valor === 'number' ? `${valor.toLocaleString('pt-BR')}%` : '—';
}

/** Telefone para o link tel: (só dígitos e +). */
export function linkTelefone(numero: string) {
  return `tel:${numero.replace(/[^\d+]/g, '')}`;
}

/** wa.me a partir de um número (com ou sem DDI 55). */
export function linkWhatsapp(numero: string, mensagem?: string) {
  let d = digitos(numero);
  if (d.length <= 11) d = `55${d}`;
  return `https://wa.me/${d}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ''}`;
}
