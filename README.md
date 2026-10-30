# Aplicativo do associado — Aliança Brasil Proteção Veicular

Um projeto só, dois aplicativos: o mesmo código gera o app de **iPhone** e o de **Android**
(Expo SDK 58 / React Native, TypeScript estrito, Expo Router).

O app não tem servidor nem banco próprios. Tudo vem da API do sistema:

- Base: `https://recupreacaodeleadsalianca.vercel.app/api/app/v1`
- Especificação: [`/api/app/v1/openapi.json`](https://recupreacaodeleadsalianca.vercel.app/api/app/v1/openapi.json)
- Página para quem programa: [`/desenvolvedores/app`](https://recupreacaodeleadsalianca.vercel.app/desenvolvedores/app)

Não há chave de API no app. O associado entra com CPF e senha (ou código do WhatsApp) e
recebe um token de sessão só dele, guardado no Keychain (iPhone) / Keystore (Android).

## Comandos

```bash
npm install
```

```bash
npm start            # servidor de desenvolvimento (abra no development build)
```

```bash
npm run api          # baixa o openapi.json e gera src/api/schema.d.ts
```

```bash
npm run typecheck    # TypeScript sem erros
```

```bash
npm run lint         # ESLint (expo lint)
```

```bash
npm test             # Jest + Testing Library
```

```bash
npm run doctor       # expo-doctor (dependências e configuração)
```

O endereço da API vem de `EXPO_PUBLIC_API_URL` (arquivo `.env`, ou `env` de cada perfil no
`eas.json`). Para outro ambiente, crie `.env.local` (não vai para o git).

O app usa módulos nativos (câmera, brilho, Keychain), então não roda no Expo Go: use um
*development build* (`npx eas-cli@latest build --profile development`).

## Estrutura

```
src/
  app/                  telas (Expo Router)
    _layout.tsx         provedores + rotas protegidas (dentro/fora da sessão)
    entrar.tsx          CPF ou CNPJ + senha (tela principal de entrada)
    whatsapp.tsx        pedir o código pelo WhatsApp
    codigo.tsx          código de 6 números (colar/autopreencher, reenviar em 60 s)
    (abas)/             Início, Carteirinha, 2ª via, Perfil
    beneficio.tsx       situação do benefício por veículo
    evento.tsx          abrir evento (WhatsApp da Central, 0800, fotos e vídeo)
    documentos.tsx      mandar documento (foto ou PDF) e ver a situação
    contratos.tsx       termo, proposta e regulamento em PDF
  api/                  cliente openapi-fetch, tipos gerados, erros
  auth/                 token (secure-store) e sessão (qualquer 401 → Entrar)
  lib/                  consultas, carteirinha offline, PDF, envio, formatação
  components/           botões, cartões, cabeçalho com degradê e logo, estados
  theme/                cores (claro/escuro), espaçamentos, alvo de toque 44 px
```

## Regras que o código segue

- Telefones, valores, textos de cobertura e links de WhatsApp vêm sempre da API.
- Token só em memória e no secure-store; nunca em AsyncStorage, log ou relatório de erro.
- CPF completo, código de acesso e dados de cartão não ficam no aparelho.
- A carteirinha guarda a última resposta de `GET /carteirinha` (o CPF já vem mascarado) para
  aparecer sem internet, com a data "conferida em". Ao sair, ela é apagada.
- Fotos são reduzidas no aparelho (lado maior até 2000 px, JPEG 0,85) antes do envio.
- Sem analytics nem rastreamento. Notificações ficam para a fase 2
  (`src/lib/notificacoes.ts` já envia `PUT /dispositivo`, sem pedir permissão).
- Vocabulário: proteção, associação, evento, benefício, contrato.

## Testar e publicar (Android e iPhone)

O passo a passo completo, do computador zerado até as duas lojas, está em
[docs/PUBLICAR-E-TESTAR.md](docs/PUBLICAR-E-TESTAR.md).

Perfis do EAS em `eas.json`:

| Perfil | Android | iPhone | Para quê |
| --- | --- | --- | --- |
| `preview` | APK | instalação direta (aparelhos cadastrados) | testar |
| `production` | AAB | IPA para App Store / TestFlight | lojas |
| `development` | dev build | dev build | programar |

```bash
npx eas-cli@latest build --platform all --profile preview
```

```bash
npx eas-cli@latest build --platform all --profile production
```

Imagens para as lojas em `assets/loja/`.

## Logo

`assets/logo.svg` e `src/components/Logo.tsx` são o símbolo da Aliança vetorizado a partir da
logo oficial (seis faixas em volta de um hexágono). Os ícones e a tela de abertura em
`assets/` saem desse desenho, em branco sobre `#0E7A84`.
