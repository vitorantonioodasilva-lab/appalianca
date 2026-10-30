import { data, dinheiro, documentoValido, linkTelefone, linkWhatsapp, mascararDocumento } from '@/lib/formato';

describe('formato', () => {
  it('mascara CPF e CNPJ enquanto digita', () => {
    expect(mascararDocumento('529982')).toBe('529.982');
    expect(mascararDocumento('52998224725')).toBe('529.982.247-25');
    expect(mascararDocumento('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('confere os dígitos verificadores', () => {
    expect(documentoValido('529.982.247-25')).toBe(true);
    expect(documentoValido('529.982.247-24')).toBe(false);
    expect(documentoValido('111.111.111-11')).toBe(false);
    expect(documentoValido('11.222.333/0001-81')).toBe(true);
    expect(documentoValido('11.222.333/0001-82')).toBe(false);
  });

  it('formata dinheiro e datas sem mudar o dia pelo fuso', () => {
    expect(dinheiro(129.9).replace(/\s/g, ' ')).toBe('R$ 129,90');
    expect(dinheiro(null)).toBe('—');
    expect(data('2026-03-10')).toBe('10/03/2026');
  });

  it('monta links de telefone e WhatsApp', () => {
    expect(linkTelefone('0800 123 4567')).toBe('tel:08001234567');
    expect(linkWhatsapp('(11) 98888-7777', 'Oi')).toBe('https://wa.me/5511988887777?text=Oi');
  });
});
