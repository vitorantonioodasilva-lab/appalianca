type Rota = { metodo?: string; status: number; corpo?: unknown };

/** Troca o fetch global por respostas fixas por caminho ("POST /entrar/senha"). */
export function simularApi(rotas: Record<string, Rota | (() => Rota)>) {
  const chamadas: { metodo: string; caminho: string; corpo?: unknown; autorizacao: string | null }[] = [];
  globalThis.fetch = jest.fn(async (entrada: RequestInfo | URL, init?: RequestInit) => {
    const req = entrada instanceof Request ? entrada : new Request(String(entrada), init);
    const caminho = new URL(req.url).pathname.replace('/api/app/v1', '');
    const metodo = req.method.toUpperCase();
    const texto = await req.text().catch(() => '');
    chamadas.push({ metodo, caminho, corpo: texto ? JSON.parse(texto) : undefined, autorizacao: req.headers.get('Authorization') });
    const r = rotas[`${metodo} ${caminho}`];
    const rota = typeof r === 'function' ? r() : r;
    if (!rota) throw new TypeError('Network request failed');
    return new Response(rota.corpo === undefined ? null : JSON.stringify(rota.corpo), {
      status: rota.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;
  return chamadas;
}

export const resumoExemplo = {
  associado: { nome: 'Maria da Silva', primeiroNome: 'Maria', documento: '***.982.247-**', matricula: 1234, situacao: 'ATIVO' },
  veiculos: [
    {
      id: 'v1',
      placa: 'ABC-1D23',
      veiculo: 'Volkswagen Gol 2020',
      plano: 'PLANO DRIVER+',
      mensalidade: 129.9,
      diaVencimento: 10,
      situacao: 'AGUARDANDO_ATIVACAO',
      situacaoTexto: 'Falta pouco para a proteção começar.',
      ativacao: [
        { etapa: 'Vistoria', feita: true },
        { etapa: 'Primeiro pagamento', feita: false },
      ],
    },
  ],
  eventos: [],
  documentos: [],
  contratos: [],
  abrirEvento: { whatsapp: 'https://wa.me/550000', telefone0800: '0800 000 0000', relato: null },
  aplicativos: null,
};
