# API Salão do Ratinho

API REST para gerenciamento do Salão do Ratinho.

## Deploy no Vercel

### Passo 1: Criar novo projeto no Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New..." → "Project"

### Passo 2: Fazer upload desta pasta
1. Na tela de criação do projeto, escolha "Import Git Repository" ou arraste esta pasta
2. **IMPORTANTE**: Faça upload apenas do conteúdo desta pasta `api-externa`, não do projeto inteiro

### Passo 3: Configurar variável de ambiente
1. Antes de fazer deploy, clique em "Environment Variables"
2. Adicione a variável:
   - **Nome**: `MONGODB_URI`
   - **Valor**: Sua connection string do MongoDB Atlas
   - Exemplo: `mongodb+srv://usuario:senha@cluster.mongodb.net/salao-do-ratinho`

### Passo 4: Deploy
1. Clique em "Deploy"
2. Aguarde o build finalizar
3. Copie a URL gerada (ex: `https://seu-projeto.vercel.app`)

### Passo 5: Testar a API
Acesse no navegador:
```
https://seu-projeto.vercel.app/api/health
```
Deve retornar: `{"status":"ok","timestamp":"..."}`

## Endpoints

### Clientes
- `GET /api/clients` - Listar todos
- `GET /api/clients/:id` - Buscar por ID
- `POST /api/clients` - Criar
- `PUT /api/clients/:id` - Atualizar
- `DELETE /api/clients/:id` - Excluir

### Serviços
- `GET /api/services` - Listar todos
- `POST /api/services` - Criar
- `PUT /api/services/:id` - Atualizar
- `DELETE /api/services/:id` - Excluir

### Agendamentos
- `GET /api/appointments?date=YYYY-MM-DD` - Listar (filtro opcional)
- `POST /api/appointments` - Criar
- `PUT /api/appointments/:id` - Atualizar
- `DELETE /api/appointments/:id` - Excluir

### Transações
- `GET /api/transactions?startDate=&endDate=` - Listar (filtro opcional)
- `GET /api/transactions/summary?startDate=&endDate=` - Resumo financeiro
- `POST /api/transactions` - Criar
- `PUT /api/transactions/:id` - Atualizar
- `DELETE /api/transactions/:id` - Excluir

### Health Check
- `GET /api/health` - Status da API

## Estrutura de Arquivos

```
api-externa/
├── api/
│   └── index.js      # Função serverless (Vercel)
├── package.json      # Dependências
├── vercel.json       # Configuração Vercel
├── .env.example      # Exemplo de variáveis
└── README.md         # Este arquivo
```

## Após o Deploy

Atualize a URL da API no frontend (arquivo `src/lib/api.ts`):
```typescript
const API_BASE_URL = 'https://sua-url-vercel.vercel.app';
```
