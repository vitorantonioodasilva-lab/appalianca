import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { Alert } from 'react-native';

import { apagarToken, guardarToken, tokenAtual } from '@/auth/token';
import { resumoExemplo, simularApi } from '../../jest/ajuda';

const comResumo = {
  'GET /resumo': { status: 200, corpo: resumoExemplo },
  'GET /cobrancas': { status: 200, corpo: { origem: 'PROPRIA', emAberto: [], pagas: [] } },
};

beforeEach(async () => {
  await apagarToken();
});

describe('entrada', () => {
  it('entra com CPF e senha e vai para o Início', async () => {
    let tentativas = 0;
    const chamadas = simularApi({
      ...comResumo,
      'POST /entrar/senha': () =>
        ++tentativas === 1
          ? { status: 401, corpo: { erro: 'CPF ou senha não conferem.' } }
          : { status: 201, corpo: { token: 'aba_novo', associado: { primeiroNome: 'Maria' } } },
    });
    await renderRouter('src/app', { initialUrl: '/entrar' });

    await fireEvent.changeText(await screen.findByTestId('campo-cpf'), '52998224724');
    await fireEvent.press(screen.getByTestId('botao-entrar'));
    expect(await screen.findByText('Confira o CPF ou CNPJ.')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('campo-cpf'), '52998224725');
    await fireEvent.changeText(screen.getByTestId('campo-senha'), 'errada');
    await fireEvent.press(screen.getByTestId('botao-entrar'));
    expect(await screen.findByText('CPF ou senha não conferem.')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('campo-senha'), 'certa');
    await fireEvent.press(screen.getByTestId('botao-entrar'));
    expect(await screen.findByText('Olá, Maria')).toBeTruthy();
    expect(tokenAtual()).toBe('aba_novo');

    const pedido = chamadas.find((c) => c.caminho === '/entrar/senha');
    expect(pedido?.corpo).toMatchObject({ cpf: '52998224725', plataforma: 'ios', dispositivo: 'Aparelho de teste' });
  });

  it('entra com o código do WhatsApp (colado com texto junto)', async () => {
    const chamadas = simularApi({
      ...comResumo,
      'POST /entrar': { status: 200, corpo: { desafio: 'd1', mensagem: 'Se o CPF for de um associado, o código chega no WhatsApp.' } },
      'POST /entrar/confirmar': { status: 201, corpo: { token: 'aba_zap' } },
    });
    await renderRouter('src/app', { initialUrl: '/whatsapp' });

    await fireEvent.changeText(await screen.findByTestId('campo-cpf'), '529.982.247-25');
    await fireEvent.press(screen.getByTestId('botao-receber'));
    expect(await screen.findByText('Se o CPF for de um associado, o código chega no WhatsApp.')).toBeTruthy();
    expect(screen.getByText(/Pode pedir outro código em 60 s/)).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('campo-codigo'), 'Seu código é 123456');
    expect(await screen.findByText('Olá, Maria')).toBeTruthy();
    expect(chamadas.find((c) => c.caminho === '/entrar/confirmar')?.corpo).toMatchObject({ desafio: 'd1', codigo: '123456' });
  });

  it('mostra a mensagem quando o acesso pelo app ainda não está ligado (503)', async () => {
    simularApi({ 'POST /entrar': { status: 503, corpo: { erro: 'O acesso pelo aplicativo ainda não foi ligado.' } } });
    await renderRouter('src/app', { initialUrl: '/whatsapp' });
    await fireEvent.changeText(await screen.findByTestId('campo-cpf'), '52998224725');
    await fireEvent.press(screen.getByTestId('botao-receber'));
    expect(await screen.findByText('O acesso pelo aplicativo ainda não foi ligado.')).toBeTruthy();
    expect(screen.getByText('Entrar com CPF e senha')).toBeTruthy();
  });

  it('qualquer 401 com sessão volta para a tela Entrar', async () => {
    await guardarToken('aba_vencido');
    simularApi({
      'GET /resumo': { status: 401, corpo: { erro: 'Sessão inválida ou vencida.' } },
      'GET /cobrancas': { status: 401, corpo: { erro: 'Sessão inválida ou vencida.' } },
    });
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByTestId('botao-entrar')).toBeTruthy();
    expect(tokenAtual()).toBeNull();
  });

  it('sair encerra a sessão no servidor e apaga o token', async () => {
    await guardarToken('aba_ativo');
    const chamadas = simularApi({ ...comResumo, 'POST /sair': { status: 200, corpo: { ok: true } } });
    const alerta = jest.spyOn(Alert, 'alert');
    await renderRouter('src/app', { initialUrl: '/perfil' });

    await fireEvent.press(await screen.findByTestId('botao-sair'));
    const botoes = alerta.mock.calls[0]?.[2] ?? [];
    await botoes.find((b) => b.text === 'Sair')?.onPress?.();

    await waitFor(() => expect(screen.getByTestId('botao-entrar')).toBeTruthy());
    expect(chamadas.some((c) => c.metodo === 'POST' && c.caminho === '/sair' && c.autorizacao === 'Bearer aba_ativo')).toBe(true);
    expect(tokenAtual()).toBeNull();
  });
});
