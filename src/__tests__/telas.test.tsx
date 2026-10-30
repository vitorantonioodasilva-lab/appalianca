import { fireEvent, screen } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { renderRouter } from 'expo-router/testing-library';
import { Linking } from 'react-native';

import { guardarToken } from '@/auth/token';
import { resumoExemplo, simularApi } from '../../jest/ajuda';

beforeEach(() => guardarToken('aba_teste'));

const cobrancas = {
  origem: 'PROPRIA',
  aviso: null,
  linkPagamento: 'https://pagamento.exemplo/abc',
  emAberto: [
    {
      id: 'c1',
      numero: 7,
      descricao: 'Mensalidade de março',
      vencimento: '2026-03-10',
      valorHoje: 132.5,
      diasAtraso: 3,
      pix: { copiaECola: '00020126pix', qrCode: null },
      boleto: { linhaDigitavel: '23790.00000 00000.000000 00000.000000 1 00000000013250', pdf: '/cobrancas/c1/boleto' },
    },
  ],
  pagas: [],
  cartao: null,
};

describe('telas', () => {
  it('Início mostra o veículo aguardando ativação com as etapas e o aviso de cobrança', async () => {
    simularApi({ 'GET /resumo': { status: 200, corpo: resumoExemplo }, 'GET /cobrancas': { status: 200, corpo: cobrancas } });
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByText('Olá, Maria')).toBeTruthy();
    expect(screen.getByText('Matrícula 1234')).toBeTruthy();
    expect(screen.getByText('Aguardando ativação')).toBeTruthy();
    expect(screen.getByText('Primeiro pagamento')).toBeTruthy();
    expect(await screen.findByText('Você tem uma cobrança em aberto')).toBeTruthy();
  });

  it('2ª via copia o Pix e a linha digitável e abre o cartão', async () => {
    simularApi({ 'GET /resumo': { status: 200, corpo: resumoExemplo }, 'GET /cobrancas': { status: 200, corpo: cobrancas } });
    await renderRouter('src/app', { initialUrl: '/cobrancas' });
    await fireEvent.press(await screen.findByText('Copiar Pix'));
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('00020126pix');
    expect(await screen.findByText('Pix copiado!')).toBeTruthy();
    await fireEvent.press(screen.getByText('Copiar linha digitável'));
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(cobrancas.emAberto[0]!.boleto.linhaDigitavel);
    expect(screen.getByText('3 dias em atraso')).toBeTruthy();
    expect(screen.getByText('Abrir boleto (PDF)')).toBeTruthy();
    expect(screen.getByText('Pagar com cartão')).toBeTruthy();
  });

  it('2ª via do SIPROV mostra o aviso que vem da API', async () => {
    simularApi({
      'GET /resumo': { status: 200, corpo: { ...resumoExemplo, contatos: { whatsapp: '11999990000' } } },
      'GET /cobrancas': { status: 200, corpo: { origem: 'SIPROV', aviso: 'A 2ª via é pelo SIPROV.', emAberto: [], pagas: [] } },
    });
    await renderRouter('src/app', { initialUrl: '/cobrancas' });
    expect(await screen.findByText('A 2ª via é pelo SIPROV.')).toBeTruthy();
    expect(await screen.findByText('Falar com a Aliança no WhatsApp')).toBeTruthy();
  });

  it('Abrir evento usa o WhatsApp e o 0800 que vêm da API', async () => {
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    simularApi({
      'GET /eventos': {
        status: 200,
        corpo: { eventos: [], abrirEvento: { whatsapp: 'https://wa.me/5511?text=Ola', telefone0800: '0800 111 2222', relato: null } },
      },
    });
    await renderRouter('src/app', { initialUrl: '/evento' });
    await fireEvent.press(await screen.findByText('Falar com a Central no WhatsApp'));
    expect(abrir).toHaveBeenCalledWith('https://wa.me/5511?text=Ola');
    await fireEvent.press(screen.getByText('Ligar 0800 111 2222'));
    expect(abrir).toHaveBeenCalledWith('tel:08001112222');
  });

  it('Documentos mostra o motivo da recusa', async () => {
    simularApi({
      'GET /resumo': { status: 200, corpo: resumoExemplo },
      'GET /documentos': {
        status: 200,
        corpo: {
          documentos: [
            { id: 'd1', tipo: 'CNH', tipoTexto: 'CNH', situacao: 'RECUSADO', situacaoTexto: 'Recusado', motivoRecusa: 'Foto sem foco.', enviadoEm: '2026-10-01T12:00:00Z' },
          ],
        },
      },
    });
    await renderRouter('src/app', { initialUrl: '/documentos' });
    expect(await screen.findByText('Motivo da recusa')).toBeTruthy();
    expect(screen.getByText('Foto sem foco. Mande de novo acima.')).toBeTruthy();
    expect(screen.getByTestId('botao-enviar-documento').props.accessibilityState.disabled).toBe(true);
  });

  it('Carteirinha mostra os contatos da assistência vindos da API', async () => {
    simularApi({
      'GET /carteirinha': {
        status: 200,
        corpo: {
          carteirinhas: [{ nome: 'Maria da Silva', matricula: 1234, documento: '***.982.247-**', placa: 'ABC-1D23', veiculo: 'Gol', plano: 'DRIVER+' }],
          assistencia24h: { telefone0800: '0800 333 4444', whatsapp: '11999990000' },
        },
      },
    });
    await renderRouter('src/app', { initialUrl: '/carteirinha' });
    expect(await screen.findByText('***.982.247-**')).toBeTruthy();
    expect(screen.getByText('Ligar 0800 333 4444')).toBeTruthy();
    expect(screen.getByText(/Funciona sem internet/)).toBeTruthy();
  });
});
