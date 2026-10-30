import { fetch } from 'expo/fetch';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { cabecalhosAutenticados, conferirResposta } from '@/api/client';
import { RedeError } from '@/api/errors';
import { API_URL, SITE_URL } from './config';

/** Caminhos que a API devolve ("/api/app/v1/...", "/contratos/...", ou URL completa). */
export function urlDaApi(caminho: string) {
  if (/^https?:\/\//.test(caminho)) return caminho;
  if (caminho.startsWith('/api/')) return `${SITE_URL}${caminho}`;
  return `${API_URL}${caminho.startsWith('/') ? '' : '/'}${caminho}`;
}

/** Baixa um PDF da API (com a sessão) e abre no leitor do aparelho. */
export async function abrirPdf(caminho: string, nomeArquivo: string) {
  let resposta: Response;
  try {
    resposta = (await fetch(urlDaApi(caminho), { headers: cabecalhosAutenticados() })) as unknown as Response;
  } catch {
    throw new RedeError();
  }
  await conferirResposta(resposta);
  const arquivo = new File(Paths.cache, nomeArquivo.replace(/[^\w.-]+/g, '-'));
  if (arquivo.exists) arquivo.delete();
  arquivo.create();
  await arquivo.write(await resposta.bytes());
  try {
    await arquivo.preview({ title: nomeArquivo, mimeType: 'application/pdf' });
  } catch {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(arquivo.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: nomeArquivo });
    }
  }
}
