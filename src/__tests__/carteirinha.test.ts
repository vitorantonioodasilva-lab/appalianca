import { guardarToken } from '@/auth/token';
import { buscarCarteirinha } from '@/lib/consultas';
import { simularApi } from '../../jest/ajuda';

const resposta = {
  carteirinhas: [{ nome: 'Maria da Silva', matricula: 1234, documento: '***.982.247-**', placa: 'ABC-1D23', veiculo: 'Gol', plano: 'DRIVER+' }],
  assistencia24h: { telefone0800: '0800 000 0000', whatsapp: '11999990000' },
};

describe('carteirinha sem internet', () => {
  beforeEach(() => guardarToken('aba_teste'));

  it('guarda a última resposta e mostra quando cai a internet', async () => {
    simularApi({ 'GET /carteirinha': { status: 200, corpo: resposta } });
    const online = await buscarCarteirinha();
    expect(online.offline).toBe(false);

    simularApi({});
    const offline = await buscarCarteirinha();
    expect(offline.offline).toBe(true);
    expect(offline.resposta).toEqual(resposta);
    expect(new Date(offline.conferidaEm).getTime()).not.toBeNaN();
  });

  it('não guarda o token junto', async () => {
    simularApi({ 'GET /carteirinha': { status: 200, corpo: resposta } });
    await buscarCarteirinha();
    const { __arquivos } = jest.requireMock('expo-file-system') as { __arquivos: Map<string, string> };
    for (const conteudo of __arquivos.values()) expect(conteudo).not.toContain('aba_teste');
  });
});
