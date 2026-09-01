# SmartHub — Central Inteligente de Monitoramento

Aplicação acadêmica da **UniFECAF** para o tema *Central Inteligente de Monitoramento: Integrando APIs para Automatizar Processos e Gerar Insights (SmartHub)*.

O SmartHub consulta cotações em tempo real, valida endereços por CEP, persiste os registros em uma base No-Code (Airtable) e dispara um webhook quando a variação percentual de alguma moeda ultrapassa **0,5%**.

## Tecnologias

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Lucide React
- next-themes (Dark / Light Mode)

## APIs utilizadas

| Integração | Função | Endpoint |
|---|---|---|
| **AwesomeAPI** | Cotações USD, EUR e BTC em BRL | `https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL` |
| **ViaCEP** | Consulta e validação de endereço | `https://viacep.com.br/ws/{cep}/json/` |
| **Airtable** | Persistência No-Code (GET/POST) | `https://api.airtable.com/v0/{baseId}/{table}` |
| **Webhook (Slack, opcional)** | Alerta de variação > 0,5% | `SLACK_WEBHOOK_URL` |

## Rotas internas (BFF)

As chamadas externas passam por Server Routes do Next.js, protegendo tokens e padronizando as respostas:

- `GET /api/currency` — busca cotações na AwesomeAPI
- `GET /api/cep?cep=01001000` — valida CEP na ViaCEP
- `GET /api/airtable` — lista o histórico
- `POST /api/airtable` — grava um registro (`{ fields }`)
- `GET` ou `POST /api/sync` — consome cotações, salva no Airtable e dispara o webhook se necessário

## Fluxo de integração

```mermaid
flowchart LR
  A[Dashboard Next.js] --> B[/api/currency]
  A --> C[/api/cep]
  A --> D[/api/airtable]
  A --> E[/api/sync]
  B --> F[AwesomeAPI]
  C --> G[ViaCEP]
  D --> H[Airtable]
  E --> F
  E --> H
  E -->|variacao > 0.5%| I[Webhook Slack]
```

1. O dashboard solicita dados às rotas internas.
2. `/api/currency` e `/api/cep` consultam APIs públicas e devolvem JSON normalizado.
3. `/api/airtable` lê e grava registros na tabela `Monitoramento_Financeiro`.
4. `/api/sync` automatiza o ciclo: cotação → persistência → alerta.

## Como configurar e rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores reais:

```bash
copy .env.local.example .env.local
```

Conteúdo esperado de `.env.local`:

```
AIRTABLE_API_KEY=seu_personal_access_token_aqui
AIRTABLE_BASE_ID=seu_base_id_aqui
AIRTABLE_TABLE_NAME=Monitoramento_Financeiro
SLACK_WEBHOOK_URL=sua_url_webhook_opcional
```

### 3. Subir o ambiente de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 4. Build de produção (opcional)

```bash
npm run build
npm start
```

## Como criar a base no Airtable

1. Acesse [https://airtable.com](https://airtable.com) e crie um workspace.
2. Crie uma **Base** (pode ser a partir de uma base em branco).
3. Renomeie a tabela para **`Monitoramento_Financeiro`**.
4. Crie os campos abaixo (nomes exatamente iguais):

| Campo | Tipo sugerido | Uso |
|---|---|---|
| `Moeda` | Single line text | Código da moeda (`USD`, `EUR`, `BTC`) ou rótulo do CEP |
| `Valor_Compra` | Number (decimal) | Bid / valor de compra |
| `Valor_Venda` | Number (decimal) | Ask / valor de venda |
| `Variacao` | Number (decimal) | Variação percentual (`pctChange`) |
| `Data_Atualizacao` | Date (incluir hora) **ou** Single line text | Timestamp da coleta |

Campos extras recomendados para a aba de CEP (a API envia `typecast: true`):

| Campo | Tipo sugerido |
|---|---|
| `Tipo` | Single select (`Cotacao`, `Endereco`) ou Single line text |
| `CEP` | Single line text |
| `Endereco` | Long text |
| `Cidade` | Single line text |
| `UF` | Single line text |

5. Gere um **Personal Access Token** em [https://airtable.com/create/tokens](https://airtable.com/create/tokens) com os escopos `data.records:read` e `data.records:write`, além de acesso à base criada.
6. Copie o **Base ID** (começa com `app...`) nas opções da ajuda da API da base.
7. Cole o token, o Base ID e o nome da tabela em `.env.local`.
8. (Opcional) Crie um Incoming Webhook no Slack e preencha `SLACK_WEBHOOK_URL`. Sem essa variável, a sincronização ainda grava no Airtable; apenas o alerta não é enviado.

## Interface

- **Aba 1 — Cotações:** cards de USD, EUR e BTC, atualização sob demanda e botão *Sincronizar e salvar*.
- **Aba 2 — CEP:** busca rápida na ViaCEP e persistência do endereço formatado.
- **Aba 3 — Histórico:** tabela com os registros consolidados do Airtable.
- Indicadores visuais de conexão (AwesomeAPI, ViaCEP e Airtable).
- Alternância Dark / Light Mode.

## Estrutura do projeto

```
app/
  api/currency/route.js
  api/cep/route.js
  api/airtable/route.js
  api/sync/route.js
  layout.js
  page.js
components/
lib/
.env.local.example
```
