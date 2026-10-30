export class ApiError extends Error {
  readonly status: number;
  readonly campos: Record<string, string>;

  constructor(status: number, mensagem: string, campos: Record<string, string> = {}) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.campos = campos;
  }
}

/** Sem internet, servidor fora do ar ou resposta que não deu para ler. */
export class RedeError extends Error {
  constructor() {
    super('Sem conexão com a Aliança. Confira a internet e tente de novo.');
    this.name = 'RedeError';
  }
}

const mensagensPadrao: Record<number, string> = {
  401: 'Sua sessão terminou. Entre de novo.',
  404: 'Não encontramos o que você pediu.',
  429: 'Muitas tentativas. Espere um pouco e tente de novo.',
  503: 'Esse serviço ainda não está disponível.',
};

export function mensagemDoErro(erro: unknown): string {
  if (erro instanceof ApiError || erro instanceof RedeError) return erro.message;
  return 'Algo deu errado. Tente de novo.';
}

export function erroDaResposta(status: number, corpo: unknown): ApiError {
  const c = (corpo ?? {}) as { erro?: unknown; campos?: unknown };
  const mensagem =
    typeof c.erro === 'string' && c.erro
      ? c.erro
      : (mensagensPadrao[status] ?? 'Algo deu errado. Tente de novo.');
  const campos =
    c.campos && typeof c.campos === 'object' ? (c.campos as Record<string, string>) : {};
  return new ApiError(status, mensagem, campos);
}
