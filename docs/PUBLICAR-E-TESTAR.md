# Manual: testar e publicar o app da Aliança Brasil

Passo a passo para os **dois aplicativos, Android e iPhone** (é o mesmo código):

- **gerar o APK** e instalar no Android para testar (passo 3);
- **testar no iPhone** pelo TestFlight ou por link direto (passo 4);
- **publicar** no Google Play (passo 6) e na App Store (passo 7).

Os aplicativos são montados na nuvem da Expo (o serviço se chama **EAS**). Você não precisa
de Android Studio nem de Xcode, nem de um Mac. Precisa só de um computador (Windows, Mac ou
Linux) com internet para digitar alguns comandos.

> Em cada bloco de comando, copie a linha inteira, cole no terminal e aperte Enter.
> Espere terminar antes de passar para o próximo.

---

## Resumo: o que vai acontecer

| Etapa | O que é | Custo | Tempo |
| --- | --- | --- | --- |
| 1. Preparar o computador | Instalar Node.js e Git e baixar o projeto | grátis | 20 min |
| 2. Conta na Expo | Onde os apps são montados | grátis (plano Free) | 5 min |
| 3. APK de teste (Android) | Arquivo para instalar no celular | grátis | 15 a 30 min por build |
| 4. Teste no iPhone | TestFlight ou link direto | precisa da conta Apple | 1 dia na primeira vez |
| 5. Pendências do sistema | Ajustes no site antes das lojas | — | — |
| 6. Google Play | Publicar no Android | US$ 25, uma vez só | 2 a 7 dias de análise |
| 7. App Store | Publicar no iPhone | US$ 99 por ano | 1 a 3 dias de análise |

O plano Free da Expo dá um número limitado de builds por mês, suficiente para começar.
Se a fila demorar muito, dá para assinar um plano pago em expo.dev.

---

## 1. Preparar o computador (uma vez só)

### 1.1 Instalar o Node.js

1. Abra https://nodejs.org e baixe a versão **LTS** (o botão da esquerda).
2. Instale com as opções padrão (Avançar, Avançar, Concluir).
3. Abra o terminal:
   - **Windows:** menu Iniciar → digite `PowerShell` → abra o **Windows PowerShell**.
   - **Mac:** aperte Cmd + Espaço → digite `Terminal` → Enter.
4. Confira se instalou (tem que aparecer um número de versão, por exemplo `v22.x.x`):

```bash
node -v
```

### 1.2 Instalar o Git

- **Windows:** baixe em https://git-scm.com/download/win e instale com as opções padrão.
- **Mac:** digite `git --version` no Terminal. Se ainda não tiver, o Mac oferece instalar;
  aceite.

Feche e abra o terminal de novo depois de instalar.

### 1.3 Baixar o projeto

O comando abaixo baixa o projeto para uma pasta `appalianca` dentro da sua pasta de usuário.
Se o GitHub pedir login, entre com a sua conta.

```bash
git clone https://github.com/vitorantonioodasilva-lab/appalianca.git
```

Entre na pasta:

```bash
cd appalianca
```

Enquanto o código não for juntado ao branch principal (merge), use o branch onde ele está:

```bash
git checkout claude/wizardly-tesla-lqsu3g
```

Instale as dependências (demora alguns minutos e mostra muito texto; é normal):

```bash
npm install
```

> **Toda vez** que for gerar um build, abra o terminal e entre na pasta com `cd appalianca`.
> Para baixar a versão mais nova do código antes, rode `git pull`.

---

## 2. Conta na Expo (uma vez só)

### 2.1 Criar a conta

1. Abra https://expo.dev/signup e crie a conta (de preferência com um e-mail da associação).
2. Opcional, mas recomendado: em expo.dev crie uma **Organization** chamada `alianca-brasil`
   e trabalhe dentro dela. Assim outras pessoas da associação podem ter acesso depois.

### 2.2 Entrar pelo terminal

```bash
npx eas-cli@latest login
```

Digite o e-mail (ou usuário) e a senha da Expo. Para conferir:

```bash
npx eas-cli@latest whoami
```

### 2.3 Ligar o projeto à sua conta

```bash
npx eas-cli@latest init
```

- Se perguntar **o dono (owner)**, escolha a organização `alianca-brasil` (ou o seu usuário).
- Se perguntar se quer **criar o projeto `@.../alianca-associado`**, responda **Y** (sim).

Esse comando grava o identificador do projeto no `app.json`. Salve essa mudança no GitHub,
para não precisar repetir:

```bash
git add app.json
```

```bash
git commit -m "Liga o projeto à conta da Expo"
```

```bash
git push
```

---

## 3. Gerar o APK e testar no Android

O perfil **`preview`** (já configurado no `eas.json`) gera um **APK**, o arquivo que se instala
direto no celular, sem passar pela loja. Ele usa a API de produção
(`https://recupreacaodeleadsalianca.vercel.app/api/app/v1`).

### 3.1 Pedir o build

```bash
npx eas-cli@latest build --platform android --profile preview
```

Na primeira vez ele faz algumas perguntas:

| Pergunta | Responda |
| --- | --- |
| `What would you like your Android application id to be?` (se aparecer) | Enter (já está `br.com.aliancabrasil.associado`) |
| `Generate a new Android Keystore?` | **Y** (sim). A Expo cria e guarda a chave de assinatura do app. |

Depois ele envia o projeto para a nuvem e mostra um link do tipo
`https://expo.dev/accounts/.../builds/...`. O build leva de 10 a 30 minutos (mais se houver
fila no plano Free). Pode fechar o terminal: o build continua na nuvem e dá para acompanhar
pelo link ou em **expo.dev → seu projeto → Builds**.

> **Guarde a chave (keystore) com cuidado.** Ela fica na sua conta Expo. Sem ela não dá para
> publicar atualizações do app no Google Play. Não apague o projeto na Expo.

### 3.2 Baixar e instalar o APK no celular

Quando o build terminar:

1. No celular Android, abra o link do build (mande para você mesmo pelo WhatsApp ou e-mail),
   ou abra a página do build no computador e aponte a câmera do celular para o **QR Code**.
2. Toque em **Install** (ou **Download**). O celular baixa o arquivo `.apk`.
3. Abra o arquivo baixado. O Android vai avisar que o app é de fonte desconhecida:
   - toque em **Configurações** → ative **Permitir desta fonte** (para o navegador ou o
     WhatsApp, o app que baixou o arquivo) → volte;
   - toque em **Instalar**.
4. Se o Play Protect avisar "app não verificado", toque em **Mais detalhes → Instalar mesmo
   assim**. É normal para app que ainda não está na loja.
5. Abra o app **Aliança Brasil**.

Para mandar o APK para outras pessoas testarem, mande o mesmo link do build. Por padrão
qualquer pessoa com o link consegue baixar. Não publique o link em lugar aberto.

### 3.3 Mandar uma versão nova para teste

Depois de qualquer mudança no código:

```bash
git pull
```

```bash
npx eas-cli@latest build --platform android --profile preview
```

Instale o novo APK por cima do antigo. Os dados (sessão) continuam.

### 3.4 O que testar (roteiro)

Use um CPF de associado real com senha cadastrada no site, ou peça um cadastro de teste.

- [ ] Entrar com CPF e senha. Senha errada mostra "CPF ou senha não conferem".
- [ ] "Primeiro acesso ou esqueci a senha" abre o site.
- [ ] Entrar com código do WhatsApp: o código chega, dá para colar, entra no app.
- [ ] Início: nome, matrícula, veículos e aviso de cobrança em aberto.
- [ ] Carteirinha: abre com brilho no máximo. Ligue o **modo avião**, feche e abra o app: a
      carteirinha continua aparecendo, com "Sem internet" e a data.
- [ ] 2ª via: Copiar Pix, Copiar linha digitável, Abrir boleto (PDF), Pagar com cartão.
- [ ] Abrir evento: o WhatsApp da Central abre com a mensagem pronta; "Ligar 0800" abre o
      discador.
- [ ] Documentos: tirar foto, escolher da galeria e mandar PDF; ver a situação na lista.
- [ ] Contratos: abrir termo, proposta e regulamento.
- [ ] Perfil: Meus dados e avisos, Sair (volta para Entrar).
- [ ] Tema escuro do celular ligado e letra grande (Configurações → Tela → Tamanho da fonte).

---

## 4. Testar no iPhone

O iPhone não instala arquivo baixado da internet sem permissão da Apple. Para qualquer teste
no iPhone é preciso a **conta paga da Apple** (faça o passo **7.1** antes). Há dois caminhos;
os dois usam o mesmo código do Android.

### Caminho A: TestFlight (recomendado)

É o app de testes da própria Apple. Não precisa cadastrar aparelho e serve para até 10 mil
pessoas.

1. Faça os passos **7.2** (contratos) e **7.3** (build e envio). O build de produção vai para o
   App Store Connect e aparece no TestFlight em 10 a 15 minutos.
2. Em https://appstoreconnect.apple.com → **Apps → Aliança Brasil → TestFlight**:
   - **Testes internos:** adicione até 100 pessoas que já são usuárias da conta Apple da
     associação (em **Usuários e acesso**). Não passa por análise da Apple.
   - **Testes externos:** crie um grupo, adicione pessoas pelo e-mail ou ative um **link
     público**. A primeira versão passa por uma análise rápida da Apple (cerca de 1 dia).
3. Quem vai testar instala o app **TestFlight** pela App Store, abre o convite (e-mail ou
   link) e toca em **Instalar**.
4. Para uma versão nova, gere e envie de novo (passo 7.3). O TestFlight avisa os testadores.

### Caminho B: instalar direto pelo link (parecido com o APK)

Bom para testar em poucos iPhones (até 100 por ano). Cada iPhone precisa ser cadastrado antes.

1. Cadastre cada iPhone:

```bash
npx eas-cli@latest device:create
```

   Escolha **Website**, entre com o Apple ID da associação quando pedir e mande o link ou o
   QR Code que aparecer para a pessoa abrir **no Safari do iPhone**. Ela instala um perfil
   (Ajustes → **Perfil baixado → Instalar**). Isso só registra o aparelho.
2. Gere o build de teste do iPhone:

```bash
npx eas-cli@latest build --platform ios --profile preview
```

   Na primeira vez, entre com o Apple ID, escolha o time e responda **Y** para gerar
   certificado e perfil. Quando perguntar quais aparelhos incluir, marque todos.
3. Quando terminar, abra o link do build **no Safari do iPhone** (ou leia o QR Code com a
   câmera) e toque em **Install**.
4. Antes de abrir o app pela primeira vez, ligue o **Modo de desenvolvedor**: Ajustes →
   **Privacidade e Segurança → Modo de Desenvolvedor** → ligar → reiniciar o iPhone →
   confirmar. (Só aparece depois de instalar o app.)
5. iPhone novo cadastrado depois? Rode o passo 2 de novo para incluir o aparelho.

### Gerar os testes dos dois de uma vez

Depois de configurar Android (passo 3) e iPhone (este passo) pela primeira vez, um comando só
gera o APK do Android e o build de teste do iPhone:

```bash
npx eas-cli@latest build --platform all --profile preview
```

Use o mesmo roteiro de teste do passo **3.4** no iPhone.

---

## 5. Pendências do sistema antes de mandar para as lojas

Estas mudanças são no **sistema** (o site/API), não no app. Sem elas o app funciona, mas
algumas coisas ficam escondidas ou as lojas podem recusar.

1. **WhatsApp dos associados no `/resumo`.** A API precisa devolver
   `"contatos": { "whatsapp": "55DDDNUMERO" }`. Sem isso o app esconde "Falar com a Aliança"
   e o botão de WhatsApp da 2ª via do SIPROV, e o "Excluir minha conta" manda para o site.
   **A Apple exige que o pedido de exclusão de conta possa ser feito a partir do app.**
2. **Política de privacidade com link aberto.** Hoje `/privacidade` pede login. As duas lojas
   exigem um endereço público (por exemplo `https://recupreacaodeleadsalianca.vercel.app/privacidade`
   aberto para todos).
3. **Modelo de mensagem aprovado na Meta.** O modelo "Código de acesso do aplicativo
   (autenticação)" precisa estar aprovado, senão a entrada por código responde 503.
4. **Conta de teste para os revisores.** A Apple e o Google entram no app para analisar.
   Crie um associado de teste (CPF válido, com veículo, carteirinha e uma cobrança de exemplo)
   e uma senha. Você vai informar esse CPF e essa senha nas lojas.

---

## 6. Publicar no Google Play (Android)

### 6.1 Criar a conta de desenvolvedor

1. Abra https://play.google.com/console/signup com a conta Google da associação.
2. Escolha **Organização** (não "pessoal"). Conta pessoal criada hoje precisa de um teste
   fechado com 12 pessoas por 14 dias antes de publicar; conta de organização não precisa.
3. Você vai precisar de:
   - CNPJ, razão social, endereço e telefone da associação;
   - **número D-U-N-S** da associação (gratuito, pedido em https://www.dnb.com/duns.html;
     pode levar alguns dias);
   - site da associação e um e-mail de contato.
4. Pague a taxa única de **US$ 25** e aguarde a verificação da identidade (alguns dias).

### 6.2 Criar o app no Play Console

1. **Criar app** → Nome: `Aliança Brasil` → Idioma padrão: Português (Brasil) → **App** →
   **Gratuito**.
2. Aceite as declarações e crie.

### 6.3 Preencher o "Conteúdo do app" (menu Política → Conteúdo do app)

| Item | O que responder |
| --- | --- |
| Política de privacidade | O link público do passo 5.2 |
| Acesso ao app | **Todas ou algumas funcionalidades são restritas** → adicione instruções: "Entre com CPF e senha" + o CPF e a senha da conta de teste (passo 5.4) |
| Anúncios | **Não**, o app não tem anúncios |
| Classificação do conteúdo | Responda o questionário (categoria Utilitário/Outro; sem violência, sem conteúdo adulto). Resultado esperado: Livre |
| Público-alvo | **18 anos ou mais** |
| App de notícias | Não |
| Apps governamentais | Não |
| Recursos financeiros | Se perguntar: o app mostra cobranças e boletos da própria associação; não é banco, empréstimo nem cripto |
| Segurança dos dados | Veja a tabela abaixo |

**Segurança dos dados (Data safety):**

- O app coleta dados? **Sim.**
- Os dados são criptografados em trânsito? **Sim** (HTTPS).
- O usuário pode pedir a exclusão dos dados? **Sim** (pelo WhatsApp ou pelo site).
- Compartilha dados com terceiros? **Não.**

| Tipo de dado | Coletado | Para quê | Opcional? |
| --- | --- | --- | --- |
| Informações pessoais → Nome | Sim | Funcionalidade do app, gerenciamento de conta | Obrigatório |
| Informações pessoais → Endereço de e-mail, Telefone | Sim (vêm do cadastro) | Gerenciamento de conta | Obrigatório |
| Informações pessoais → Outras (CPF) | Sim | Funcionalidade do app, gerenciamento de conta | Obrigatório |
| Informações financeiras → Histórico de compras/pagamentos | Sim (mensalidades) | Funcionalidade do app | Obrigatório |
| Fotos e vídeos → Fotos | Sim (documentos e fotos do veículo que o associado manda) | Funcionalidade do app | Opcional |
| Arquivos e documentos | Sim (PDF que o associado manda) | Funcionalidade do app | Opcional |

Não marque localização, contatos, identificadores de publicidade nem dados de uso para
publicidade: o app não coleta isso.

### 6.4 Ficha da loja (menu Crescimento → Presença na loja → Versão principal da página)

- **Nome do app:** `Aliança Brasil`
- **Descrição curta** (até 80 caracteres):
  `2ª via, carteirinha digital e atendimento 24 h para associados da Aliança Brasil.`
- **Descrição completa** (sugestão):

```text
O aplicativo oficial do associado da Aliança Brasil Proteção Veicular.

• 2ª via da mensalidade: copie o Pix ou a linha digitável, abra o boleto em PDF ou pague com cartão.
• Carteirinha digital: mostre quando precisar, mesmo sem internet.
• Situação do benefício: plano, mensalidade, vencimento, reboque e cota de participação.
• Abrir evento: fale com a Central 24 h pelo WhatsApp com a mensagem pronta ou ligue para o 0800.
• Documentos: mande CNH, CRLV, comprovante e fotos do veículo pelo celular e acompanhe a conferência.
• Contratos: termo de adesão, proposta de filiação e regulamento em PDF.

Entre com o seu CPF e a mesma senha da área do associado no site, ou com um código enviado para o seu WhatsApp.

A Aliança Brasil é uma associação de proteção veicular.
```

- **Ícone do app (512 × 512):** `assets/loja/icone-512.png`
- **Gráfico de recursos (1024 × 500):** `assets/loja/destaque-google-play-1024x500.png`
- **Capturas de tela do telefone:** pelo menos 2 (recomendado 4 a 8). Tire no celular com o
  APK de teste (botão liga/desliga + volume baixo), com a conta de teste, das telas Início,
  Carteirinha, 2ª via, Abrir evento e Documentos.
- **Categoria:** Auto e veículos (ou Finanças). **E-mail de contato:** o da associação.

### 6.5 Dar à Expo permissão para enviar o app (chave de serviço do Google)

A Expo precisa de uma chave para mandar o app para o Play Console por você.

1. Siga o guia (em inglês, com imagens): https://expo.fyi/creating-google-service-account
   Em resumo: no Google Cloud, crie uma **conta de serviço**, gere uma **chave JSON** e, no
   Play Console (**Usuários e permissões**), convide o e-mail dessa conta com permissão de
   **Administrador** (ou pelo menos "Lançar apps").
2. Envie a chave para a Expo: em **expo.dev → seu projeto → Credentials → Android →
   br.com.aliancabrasil.associado → Service credentials → Add a Google service account key →
   Upload new key**, escolha o arquivo `.json` e **Save**.
3. **Nunca** coloque esse arquivo `.json` no GitHub (o projeto já ignora arquivos com
   `service-account` no nome).

### 6.6 Gerar a versão de loja e enviar

O perfil **`production`** gera um **AAB** (o formato que o Google Play pede; não é APK) e
aumenta o número da versão sozinho a cada build.

```bash
npx eas-cli@latest build --platform android --profile production
```

Quando terminar:

```bash
npx eas-cli@latest submit --platform android --profile production --latest
```

O envio fica como **rascunho** na faixa de **Teste interno** (configurado no `eas.json`).

> Se a primeira tentativa de envio der erro dizendo que o app ainda não existe na API,
> faça a primeira subida à mão: baixe o `.aab` na página do build em expo.dev e, no Play
> Console, vá em **Testar e lançar → Testes → Teste interno → Criar versão** e arraste o
> arquivo. Do segundo envio em diante o `submit` funciona.

### 6.7 Testar pela loja e lançar

1. Play Console → **Testar e lançar → Testes → Teste interno**: abra a versão em rascunho →
   **Revisar versão → Iniciar lançamento**. Em **Testadores**, crie uma lista com os e-mails
   de quem vai testar e copie o link de participação. Os testadores instalam pela Play Store.
2. Quando estiver tudo certo: **Testar e lançar → Produção → Criar versão → Adicionar da
   biblioteca** (escolha a mesma versão) → países: **Brasil** → **Revisar → Iniciar
   lançamento para produção**.
3. O Google analisa (de algumas horas a 7 dias na primeira vez). Você recebe um e-mail
   quando aprovar.

---

## 7. Publicar na App Store (iPhone)

### 7.1 Criar a conta Apple Developer (organização)

1. Crie (ou use) um **Apple ID** da associação com verificação em duas etapas ligada.
2. Abra https://developer.apple.com/programs/enroll e escolha **Organization**.
3. Você vai precisar de:
   - razão social exatamente como no CNPJ;
   - **número D-U-N-S** (o mesmo do passo 6.1);
   - site da associação com o mesmo nome/domínio;
   - autoridade legal para assinar pela associação (a Apple pode ligar para confirmar).
4. Pague a anuidade de **US$ 99** (cobrada em reais). A aprovação leva de 1 a 7 dias.

### 7.2 Aceitar os contratos

Em https://appstoreconnect.apple.com → **Negócios** (Business), aceite o **Contrato de
Licença do Programa** e o contrato de **apps gratuitos**. Sem isso o envio falha.

### 7.3 Gerar a versão de loja e enviar

```bash
npx eas-cli@latest build --platform ios --profile production
```

Na primeira vez:

| Pergunta | Responda |
| --- | --- |
| `Do you want to log in to your Apple account?` | **Y** e entre com o Apple ID da associação (vai pedir o código de duas etapas) |
| Escolher o time (Team) | O time da associação |
| `Generate a new Apple Distribution Certificate?` | **Y** |
| `Generate a new Apple Provisioning Profile?` | **Y** |

A Expo cria e guarda os certificados. Quando o build terminar:

```bash
npx eas-cli@latest submit --platform ios --profile production --latest
```

Na primeira vez ele pede o Apple ID e **cria o app no App Store Connect** sozinho (nome
"Aliança Brasil", identificador `br.com.aliancabrasil.associado`). Se pedir uma **chave de API
do App Store Connect**, deixe a Expo gerar (**Y**). Depois de 10 a 15 minutos a versão
aparece em **App Store Connect → Apps → Aliança Brasil → TestFlight** (veja o passo 4 para
testar).

> Se o nome "Aliança Brasil" já estiver em uso por outro app na App Store, troque o nome da
> página da loja para, por exemplo, "Aliança Brasil Associado" no App Store Connect.

### 7.4 Preencher a página do app no App Store Connect

**Informações do app (App Information):**

- **Subtítulo** (até 30 caracteres): `Associado Proteção Veicular`
- **Categoria principal:** Utilidades (secundária: Finanças, opcional)
- **Classificação etária:** responda o questionário (tudo "Nenhum"); resultado 4+.

**Privacidade do app (App Privacy):**

- **Link da política de privacidade:** o do passo 5.2.
- "Você ou seus parceiros coletam dados deste app?" **Sim.**
- Para cada tipo abaixo marque **Funcionalidade do app**, **vinculado à identidade do
  usuário: Sim** e **usado para rastreamento: Não**:

| Categoria na Apple | Dado |
| --- | --- |
| Informações de contato → Nome | Nome do associado |
| Informações de contato → Endereço de e-mail, Número de telefone | Do cadastro |
| Informações financeiras → Outras informações financeiras | Mensalidades e cobranças |
| Identificadores → ID do usuário | CPF e matrícula |
| Conteúdo do usuário → Fotos ou vídeos | Fotos de documentos e do veículo |
| Conteúdo do usuário → Outro conteúdo do usuário | PDFs enviados |

Não marque localização, contatos, histórico de navegação, identificadores de publicidade nem
dados de uso: o app não coleta isso e não tem rastreamento.

**Versão 1.0 (página da versão, em "Distribuição"):**

- **Capturas de tela do iPhone:** a App Store pede pelo menos 1 (até 10) no tamanho de
  6,9" (1320 × 2868 ou 1290 × 2796 pixels). Tire num iPhone grande pelo TestFlight. O tamanho
  exato aceito aparece na própria tela de envio.
- **Texto promocional** (opcional): `2ª via, carteirinha digital e Central 24 h na palma da mão.`
- **Descrição:** a mesma do passo 6.4.
- **Palavras-chave:** `proteção veicular,associação,carteirinha,2ª via,boleto,pix,reboque,assistência 24h`
- **URL de suporte:** o site da associação. **URL de marketing:** opcional.
- **Build:** clique em **Adicionar build** e escolha o que veio do `submit`.
- **Direitos autorais:** `2026 Aliança Brasil Proteção Veicular`
- **Informações para a revisão do app** (muito importante):
  - **Login necessário:** marque e informe o **CPF** (no campo usuário) e a **senha** da conta
    de teste do passo 5.4.
  - **Notas:** `Entre com CPF e senha na primeira tela. A Aliança Brasil é uma associação de
    proteção veicular. O associado consulta a 2ª via, a carteirinha e manda documentos. A
    exclusão de conta fica em Perfil → Excluir minha conta.`
  - Telefone e e-mail de contato de alguém da associação.
- **Lançamento da versão:** "Lançar manualmente" (você decide o dia) ou "automaticamente".

Clique em **Adicionar para revisão → Enviar para revisão**. A análise leva de 1 a 3 dias.
Se a Apple recusar, ela explica o motivo no App Store Connect; dá para responder e reenviar.

---

## 8. Atualizar o app depois de publicado

1. Faça as mudanças no código e salve no GitHub.
2. Para uma versão nova nas lojas, aumente a versão no `app.json` (`"version": "1.0.0"` →
   `"1.0.1"` para correções, `"1.1.0"` para novidades). O número interno do build já sobe
   sozinho.
3. Gere e envie de novo:

```bash
npx eas-cli@latest build --platform all --profile production
```

```bash
npx eas-cli@latest submit --platform android --profile production --latest
```

```bash
npx eas-cli@latest submit --platform ios --profile production --latest
```

4. No Play Console, lance a versão nova em Produção. No App Store Connect, crie a versão nova
   (botão **+** ao lado de "App para iOS"), escolha o build e envie para revisão.

---

## 9. Depois que o app estiver nas lojas

- No sistema, troque os links `appIos` e `appAndroid` em `src/server/domain/contacts.ts` pelos
  links das lojas:
  - Google Play: `https://play.google.com/store/apps/details?id=br.com.aliancabrasil.associado`
  - App Store: o link aparece em App Store Connect → App Information → "Ver na App Store".

---

## 10. Problemas comuns

| Problema | O que fazer |
| --- | --- |
| `npx: command not found` ou `node` não reconhecido | Feche e abra o terminal. Se continuar, reinstale o Node.js (passo 1.1). |
| `An Expo user account is required` | Rode `npx eas-cli@latest login`. |
| `EAS project not configured` | Rode `npx eas-cli@latest init` (passo 2.3) dentro da pasta `appalianca`. |
| Build demora muito na fila | É o plano Free. Espere ou assine um plano em expo.dev. |
| Build falhou | Abra o link do build em expo.dev: a página mostra o erro em vermelho. Copie e mande para quem cuida do código. |
| Android: "App não instalado" | Desinstale a versão antiga do app e instale de novo. |
| Android: não aparece a opção de instalar | Ative "Permitir desta fonte" para o app que baixou o arquivo (passo 3.2). |
| Entrar com código responde "ainda não está disponível" | O modelo de mensagem da Meta ainda não foi aprovado (passo 5.3). Use CPF e senha. |
| iPhone: `submit` falha com erro de contrato | Aceite os contratos no App Store Connect (passo 7.2). |
| Google Play recusou por "Acesso ao app" | Confira se o CPF e a senha de teste do passo 6.3 funcionam. |
| Apple recusou pela exclusão de conta | Faça o passo 5.1 (WhatsApp no `/resumo`) e reenvie. |

---

## Arquivos do projeto citados aqui

- `eas.json`: perfis de build (`development`, `preview` = APK de teste, `production` = lojas)
  e de envio.
- `app.json`: nome, versão, identificador `br.com.aliancabrasil.associado`, ícones e
  permissões.
- `assets/loja/`: ícone 512, ícone 1024, gráfico 1024 × 500 do Google Play e a logo oficial.
