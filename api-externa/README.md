# API Salão do Ratinho

API REST para gerenciamento do Salão do Ratinho.

## Deploy Rápido

### Render (Recomendado - Gratuito)

1. Acesse [render.com](https://render.com) e crie uma conta
2. Clique em "New" → "Web Service"
3. Conecte seu repositório GitHub ou faça upload do código
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Adicione `MONGODB_URI` com sua connection string

### Railway

1. Acesse [railway.app](https://railway.app)
2. Crie um novo projeto
3. Faça deploy via GitHub ou CLI
4. Adicione a variável `MONGODB_URI` nas configurações

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env
# Edite o .env com sua MONGODB_URI

# Iniciar em modo desenvolvimento
npm run dev

# Iniciar em produção
npm start
```

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
- `GET /api/appointments?date=YYYY-MM-DD` - Listar (filtro opcional por data)
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
- `GET /health` - Status da API

## Após o Deploy

Copie a URL da sua API (ex: `https://api-salao.onrender.com`) e configure no frontend do Lovable.
