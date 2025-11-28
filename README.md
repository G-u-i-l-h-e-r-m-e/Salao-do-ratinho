# Salão do Ratinho 💈

Sistema completo de gestão para barbearias e salões de beleza, desenvolvido com tecnologias modernas para oferecer uma experiência fluida tanto para administradores quanto para clientes.

## 📋 Sobre o Projeto

O **Salão do Ratinho** é uma aplicação web full-stack que permite:

- **Para Administradores (Barbeiros):**
  - Gerenciar agendamentos
  - Cadastrar e administrar clientes
  - Controlar serviços oferecidos
  - Acompanhar o financeiro (receitas e despesas)
  - Visualizar dashboard com métricas do negócio
  - Configurar horários de funcionamento

- **Para Clientes:**
  - Realizar login e cadastro
  - Agendar horários online
  - Visualizar histórico de agendamentos
  - Acessar informações do salão

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server ultrarrápido
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes de UI acessíveis e customizáveis
- **React Router DOM** - Roteamento SPA
- **React Query** - Gerenciamento de estado servidor
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas

### Backend
- **API REST** - Backend customizado em Node.js/Express
- **MongoDB** - Banco de dados NoSQL para dados do negócio

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   └── ...             # Componentes específicos do app
├── hooks/              # Custom hooks React
├── pages/              # Páginas/rotas da aplicação
├── lib/                # Utilitários e configurações
├── integrations/       # Integrações externas (Supabase)
└── assets/             # Arquivos estáticos

api-externa/            # API REST externa
├── api/
│   └── index.js       # Função serverless (Vercel)
└── ...
```

## 📱 Páginas Principais

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/auth` | Login/Cadastro do administrador |
| `/dashboard` | Painel com métricas e resumos |
| `/agendamentos` | Gestão de agendamentos |
| `/clientes` | Cadastro e gestão de clientes |
| `/financeiro` | Controle financeiro |
| `/configuracoes` | Configurações do sistema |
| `/cliente/auth` | Login/Cadastro de clientes |
| `/cliente/portal` | Portal do cliente |

## 🔐 Autenticação

O sistema possui dois fluxos de autenticação distintos:

1. **Administrador**: Acesso completo ao sistema de gestão
2. **Cliente**: Acesso ao portal de agendamentos

A autenticação é gerenciada pelo Supabase Auth com:
- Login por email/senha
- Confirmação automática de email
- Sessões persistentes

## ⚙️ Configuração e Execução

### Pré-requisitos
- Node.js 18+
- npm ou bun

### Instalação

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>

# Acesse a pasta do projeto
cd salao-do-ratinho

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:8080`

### Variáveis de Ambiente

Para a API externa:
- `MONGODB_URI` - String de conexão do MongoDB

## 🎨 Design System

O projeto utiliza um design system customizado com:

- **Tema escuro** como padrão
- **Cores douradas** como destaque (marca do salão)
- **Componentes responsivos** para mobile e desktop
- **Animações suaves** para melhor UX

## 📊 Funcionalidades Detalhadas

### Dashboard
- Resumo de agendamentos do dia
- Receita do período
- Gráfico de faturamento
- Próximos agendamentos

### Agendamentos
- Calendário interativo
- Filtros por status e data
- Criação/edição/cancelamento
- Lembretes automáticos

### Clientes
- Cadastro completo
- Histórico de visitas
- Total gasto
- Busca e filtros

### Financeiro
- Registro de receitas e despesas
- Resumo por período
- Gráficos de evolução
- Exportação de dados

### Portal do Cliente
- Agendamento online
- Visualização de horários disponíveis
- Histórico de serviços
- Informações do salão

## 🚀 Deploy


### API Externa (Vercel)
```bash
cd api-externa
vercel deploy --prod
```

## 📄 Licença

Este projeto foi desenvolvido exclusivamente para o Salão do Ratinho.

## 👥 Contato

Para dúvidas ou suporte, entre em contato através do salão.

---

# Salao-do-ratinho
