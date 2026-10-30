import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { cabecalhosAutenticados, conferirResposta } from '@/api/client';
import { RedeError } from '@/api/errors';
import type { Documento, TipoDocumento } from '@/api/types';
import { API_URL } from './config';

export type ArquivoEscolhido = { uri: string; nome: string; tipo: string };

export const LADO_MAXIMO = 2000;
export const LIMITE_BYTES = 4 * 1024 * 1024;

/** Reduz a foto no aparelho: lado maior até 2000 px, JPEG qualidade 0,85. */
export async function reduzirFoto(foto: ArquivoEscolhido): Promise<ArquivoEscolhido> {
  const contexto = ImageManipulator.manipulate(foto.uri);
  let imagem = await contexto.renderAsync();
  if (imagem.width > LADO_MAXIMO || imagem.height > LADO_MAXIMO) {
    contexto.resize(imagem.width >= imagem.height ? { width: LADO_MAXIMO } : { height: LADO_MAXIMO });
    imagem = await contexto.renderAsync();
  }
  const salva = await imagem.saveAsync({ compress: 0.85, format: SaveFormat.JPEG });
  return {
    uri: salva.uri,
    nome: foto.nome.replace(/\.\w+$/, '') + '.jpg',
    tipo: 'image/jpeg',
  };
}

export const TIPOS: { valor: TipoDocumento; texto: string }[] = [
  { valor: 'CNH', texto: 'CNH' },
  { valor: 'CRLV', texto: 'Documento do veículo (CRLV)' },
  { valor: 'COMPROVANTE_RESIDENCIA', texto: 'Comprovante de residência' },
  { valor: 'FOTO_VEICULO', texto: 'Foto do veículo' },
  { valor: 'BOLETIM_OCORRENCIA', texto: 'Boletim de ocorrência' },
  { valor: 'OUTRO', texto: 'Outro documento' },
];

export async function enviarDocumento(dados: {
  tipo: TipoDocumento;
  arquivo: ArquivoEscolhido;
  veiculoId?: string;
  observacao?: string;
}): Promise<Documento> {
  const form = new FormData();
  form.append('tipo', dados.tipo);
  // React Native envia o arquivo a partir de { uri, name, type }.
  form.append('arquivo', { uri: dados.arquivo.uri, name: dados.arquivo.nome, type: dados.arquivo.tipo } as unknown as Blob);
  if (dados.veiculoId) form.append('veiculoId', dados.veiculoId);
  if (dados.observacao?.trim()) form.append('observacao', dados.observacao.trim().slice(0, 300));

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}/documentos`, { method: 'POST', headers: cabecalhosAutenticados(), body: form });
  } catch {
    throw new RedeError();
  }
  await conferirResposta(resposta);
  return (await resposta.json()) as Documento;
}
