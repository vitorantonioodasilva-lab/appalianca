import type { components, paths } from './schema';

type Schemas = components['schemas'];
type Json<P extends keyof paths, M extends keyof paths[P], S extends number> = paths[P][M] extends {
  responses: { [K in S]: { content: { 'application/json': infer T } } };
}
  ? T
  : never;

export type Veiculo = Schemas['Veiculo'];
export type Carteirinha = Schemas['Carteirinha'];
export type Cobranca = Schemas['Cobranca'];
export type Documento = Schemas['Documento'];
export type TipoDocumento = NonNullable<Documento['tipo']>;
export type Evento = Schemas['Evento'];
export type AbrirEvento = Schemas['AbrirEvento'];

export type Resumo = Json<'/resumo', 'get', 200>;
export type CarteirinhaResposta = Json<'/carteirinha', 'get', 200>;
export type Cobrancas = Json<'/cobrancas', 'get', 200>;
export type Eventos = Json<'/eventos', 'get', 200>;
export type Contratos = Json<'/contratos', 'get', 200>;
export type Contrato = NonNullable<Contratos['contratos']>[number];
export type Documentos = Json<'/documentos', 'get', 200>;
export type Sessao = Json<'/entrar/senha', 'post', 201>;
export type PedidoCodigo = Json<'/entrar', 'post', 200>;
