// Baixa a especificação OpenAPI da API do app e gera os tipos do cliente.
// Uso: npm run api   (EXPO_PUBLIC_API_URL muda o servidor de onde baixar)
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

function apiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  const linha = env.split('\n').find((l) => l.startsWith('EXPO_PUBLIC_API_URL='));
  if (!linha) throw new Error('EXPO_PUBLIC_API_URL não definido no .env');
  return linha.slice('EXPO_PUBLIC_API_URL='.length).trim();
}

const url = `${apiUrl().replace(/\/$/, '')}/openapi.json`;
const resposta = await fetch(url);
if (!resposta.ok) throw new Error(`Não consegui baixar ${url}: HTTP ${resposta.status}`);
const spec = await resposta.json();
writeFileSync('src/api/openapi.json', JSON.stringify(spec, null, 2) + '\n');
execFileSync('npx', ['openapi-typescript', 'src/api/openapi.json', '-o', 'src/api/schema.d.ts'], {
  stdio: 'inherit',
});
console.log(`Tipos gerados de ${url}`);
