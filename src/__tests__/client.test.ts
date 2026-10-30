import { api, pedir } from '@/api/client';
import { ApiError, RedeError } from '@/api/errors';
import { guardarToken, quandoSessaoExpirar, tokenAtual } from '@/auth/token';
import { simularApi } from '../../jest/ajuda';

describe('cliente da API', () => {
  it('manda o token da sessão em toda chamada', async () => {
    await guardarToken('aba_teste');
    const chamadas = simularApi({ 'GET /resumo': { status: 200, corpo: { veiculos: [] } } });
    await pedir(api.GET('/resumo'));
    expect(chamadas[0]?.autorizacao).toBe('Bearer aba_teste');
  });

  it('qualquer 401 com sessão apaga o token e avisa a sessão', async () => {
    await guardarToken('aba_teste');
    const expirou = jest.fn();
    quandoSessaoExpirar(expirou);
    simularApi({ 'GET /cobrancas': { status: 401, corpo: { erro: 'Sessão inválida ou vencida.' } } });
    await expect(pedir(api.GET('/cobrancas'))).rejects.toMatchObject({ status: 401 });
    expect(tokenAtual()).toBeNull();
    expect(expirou).toHaveBeenCalledTimes(1);
    quandoSessaoExpirar(null);
  });

  it('401 na entrada (sem sessão) não encerra nada: é senha errada', async () => {
    const expirou = jest.fn();
    quandoSessaoExpirar(expirou);
    simularApi({ 'POST /entrar/senha': { status: 401, corpo: { erro: 'CPF ou senha não conferem.' } } });
    await expect(pedir(api.POST('/entrar/senha', { body: { cpf: '52998224725', senha: 'x' } }))).rejects.toBeInstanceOf(ApiError);
    expect(expirou).not.toHaveBeenCalled();
    quandoSessaoExpirar(null);
  });

  it('sem internet vira RedeError com mensagem curta', async () => {
    simularApi({});
    await expect(pedir(api.GET('/resumo'))).rejects.toBeInstanceOf(RedeError);
  });

  it('usa a mensagem e os campos que vêm da API', async () => {
    simularApi({ 'POST /entrar': { status: 422, corpo: { erro: 'Dados inválidos.', campos: { cpf: 'CPF ou CNPJ inválido.' } } } });
    const erro = await pedir(api.POST('/entrar', { body: { cpf: '1' } })).catch((e) => e);
    expect(erro).toBeInstanceOf(ApiError);
    expect(erro.campos.cpf).toBe('CPF ou CNPJ inválido.');
  });
});
