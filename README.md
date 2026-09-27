# Sistema de Requisições de Manutenção

> **Operações de manutenção** | Requisições · Usuários · Locais · Categorias · Dashboard

Este é um sistema web para registrar, acompanhar e organizar requisições de manutenção. A aplicação combina uma API REST em NestJS com um painel operacional em React, permitindo que equipes consultem requisições, acompanhem status e visualizem informações de operação em um único ambiente.

## Objetivo

Fornecer uma base centralizada para o fluxo de manutenção:

- autenticação e controle de sessão;
- consulta de requisições e seus detalhes;
- atualização do status das requisições;
- consulta de usuários, locais, categorias e executores;
- resumo operacional para acompanhamento da equipe;
- persistência relacional em MySQL.

## Como funciona

```text
[ Usuário ]
     ↓
[ Dashboard React + Vite ]
     ↓ HTTP/JSON
[ API NestJS ] ─── [ Autenticação e regras de negócio ]
     ↓
[ TypeORM ]
     ↓
[ Banco de dados MySQL ]
```

1. O usuário acessa o painel web pelo navegador.
2. O frontend envia requisições HTTP para a API NestJS.
3. A API valida os dados, aplica as regras da aplicação e consulta os serviços.
4. O TypeORM faz o mapeamento entre as entidades e o MySQL.
5. Os resultados são exibidos no dashboard e nas telas de operação.

## Tecnologias utilizadas

### Backend

| Tecnologia | Função |
|---|---|
| ![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?style=for-the-badge&logo=node.js&logoColor=white) | Ambiente de execução JavaScript/TypeScript |
| ![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white) | Framework da API REST |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white) | Tipagem e linguagem do backend |
| ![TypeORM](https://img.shields.io/badge/TypeORM-0.3-FE0803?style=for-the-badge) | ORM e mapeamento das entidades |
| ![MySQL](https://img.shields.io/badge/MySQL-8%2B-4479A1?style=for-the-badge&logo=mysql&logoColor=white) | Banco de dados relacional |
| ![Passport](https://img.shields.io/badge/Passport-JWT-34E27A?style=for-the-badge) | Autenticação e autorização |

### Frontend

| Tecnologia | Função |
|---|---|
| ![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black) | Interface da aplicação |
| ![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white) | Servidor de desenvolvimento e build |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white) | Tipagem do frontend |
| ![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?style=for-the-badge) | Cliente HTTP |
| ![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge) | Cache e estado assíncrono |
| ![Zustand](https://img.shields.io/badge/Zustand-5-443E38?style=for-the-badge) | Estado global da sessão |
| ![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white) | Navegação da aplicação |

## Pré-requisitos

Instale os seguintes recursos antes de executar o projeto:

- [Node.js](https://nodejs.org/) 22+ (LTS recomendado);
- npm 10+;
- [MySQL](https://www.mysql.com/) 8+;
- [Git](https://git-scm.com/).

O projeto não possui uma configuração Docker versionada atualmente. O MySQL deve estar disponível localmente ou em um ambiente externo acessível pela API.

---

## Setup do Backend (NestJS)

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env` a partir do exemplo:

```bash
cp src/config/.env.example src/config/.env
```

No Windows PowerShell:

```powershell
Copy-Item src/config/.env.example src/config/.env
```

### 3. Ajustar credenciais

Edite `backend/src/config/.env` com as suas credenciais:

```env
# Servidor
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Banco de dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=sua-senha
DB_NAME=maintenance_system
DB_SYNCHRONIZE=true
```

> **Nota:** `DB_SYNCHRONIZE=true` cria/atualiza as tabelas automaticamente em desenvolvimento. Em produção, defina como `false` e use migrations.

### 4. Criar o banco de dados

```sql
CREATE DATABASE maintenance_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Popular com dados iniciais (seed)

```bash
npm run seed
```

O seed é **idempotente** — registros existentes são ignorados, então pode ser executado várias vezes sem duplicar dados.

**O que é criado:**

| Item | Descrição |
|------|-----------|
| **Administrador** | Usuário inicial com perfil `admin` |
| **Locais** | 12 locais (Salas 101–301, Andar 1–2, Térreo, Subsolo, Cozinha, Banheiros) |
| **Categorias** | 10 categorias de manutenção (Elétrica, Hidráulica, Mobiliário, Eletrônicos, Ar-condicionado, Pintura, Estrutural, Limpeza, Jardinagem, Segurança) |

**Credenciais do administrador:**

```text
E-mail: admin@empresa.com
Senha: Admin@123
```

### 6. Executar

```bash
# Desenvolvimento (watch mode)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A API ficará disponível em `http://localhost:3000/api`.

---

## Setup do Frontend (Vite + React)

### 1. Instalar dependências

```bash
cd frontend
npm install
```

### 2. Configurar variáveis de ambiente (opcional)

Para desenvolvimento local, o Vite já possui um proxy configurado que encaminha `/api` para `http://localhost:3000`. Nenhuma configuração adicional é necessária.

Se precisar apontar para outro endereço:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Executar

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

O frontend ficará disponível em `http://localhost:5173`.

---

## Executando o projeto completo

1. **MySQL** — certifique-se de que o banco está rodando e acessível.
2. **Backend** — em um terminal: `cd backend && npm run start:dev`
3. **Frontend** — em outro terminal: `cd frontend && npm run dev`
4. **Acessar** — abra `http://localhost:5173` no navegador.
5. **Login** — use `admin@empresa.com` / `Admin@123` (se executou o seed).

## Configuração do backend

Entre na pasta do backend e instale as dependências:

```bash
cd backend
npm install
```

Crie o arquivo de ambiente a partir do exemplo:

```bash
cp src/config/.env.example src/config/.env
```

No Windows PowerShell, use:

```powershell
Copy-Item src/config/.env.example src/config/.env
```

Ajuste as credenciais do MySQL em `backend/src/config/.env`:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=change-me
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=maintenance_system
DB_SYNCHRONIZE=true
```

Crie o banco antes de iniciar a API:

```sql
CREATE DATABASE maintenance_system;
```

Para desenvolvimento, `DB_SYNCHRONIZE=true` permite que o TypeORM sincronize as entidades com o banco. Em produção, prefira migrations e mantenha essa opção desativada.

### Seed do administrador inicial

Com o banco criado e o arquivo `.env` configurado, execute no diretório `backend/`:

```bash
npm run seed
```

O seed é idempotente. Na primeira execução, cria automaticamente:

```text
E-mail: admin@empresa.com
Senha: Admin@123
```

As credenciais são exibidas no console. Se o administrador já existir, o seed não altera a senha atual.

## Configuração do frontend

Em outro terminal, entre na pasta do frontend e instale as dependências:

```bash
cd frontend
npm install
```

O frontend já usa o proxy do Vite para encaminhar `/api` para `http://localhost:3000`. Essa é a configuração recomendada para desenvolvimento local.

Se precisar apontar diretamente para outro endereço da API, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Defina a URL desejada:

```env
VITE_API_URL=http://localhost:3000/api
```

## Executar localmente

### 1. Iniciar a API

No diretório `backend/`:

```bash
npm run start:dev
```

A API ficará disponível em:

- Base da API: `http://localhost:3000/api`
- Health check: `GET http://localhost:3000/api/health`

### 2. Iniciar o painel web

No diretório `frontend/`:

```bash
npm run dev
```

O frontend ficará disponível em `http://localhost:5173`.

## Comandos úteis

### Backend

```bash
npm run start       # Inicia a API normalmente
npm run start:dev   # Inicia a API com watch mode
npm run build       # Compila o backend
npm run seed        # Cria o administrador inicial e exibe as credenciais
npm run start:prod  # Executa a versão compilada
npm run lint        # Executa o ESLint com correção automática
```

### Frontend

```bash
npm run dev         # Inicia o servidor Vite
npm run build       # Verifica os tipos e gera o build de produção
npm run preview     # Serve o build localmente para validação
```

## Primeiro acesso do cliente

1. Execute `npm run seed` na pasta `backend/`.
2. Inicie backend e frontend.
3. Entre no painel com `admin@empresa.com` e `Admin@123`.
4. Acesse **Administração** → **Usuários**.
5. Altere a senha do próprio administrador para uma senha segura.
6. Crie os acessos necessários, escolhendo entre `Solicitante`, `Executor` e `Gestor`.


## Estrutura de pastas

```text
RequestSystem/
├── backend/
│   └── src/
│       ├── common/       # Recursos compartilhados entre funcionalidades
│       ├── config/       # Arquivos de ambiente e exemplos de configuração
│       ├── controllers/  # Endpoints HTTP da API
│       ├── core/         # Configuração, segurança, integrações e infraestrutura
│       ├── dtos/         # Contratos de entrada e saída por funcionalidade
│       ├── models/       # Entidades TypeORM e tabelas do MySQL
│       ├── modules/      # Composição dos módulos NestJS
│       └── services/     # Regras de negócio e coordenação das operações
│
└── frontend/
    └── src/
	  ├── services/     # Comunicação HTTP com a API
	  ├── store/        # Estado global da aplicação
	  ├── App.tsx       # Rotas e interface principal
	  ├── main.tsx      # Ponto de entrada do React
	  ├── styles.css    # Estilos globais
	  └── types.ts      # Tipos compartilhados do frontend
```

## Funcionalidades disponíveis

O frontend está conectado aos endpoints atualmente implementados para:

- login e logout;
- resumo do dashboard;
- listagem e detalhes de requisições;
- atualização de status de requisições;
- consulta de usuários;
- cadastro de locais (listar, criar, editar e excluir);
- cadastro de categorias de manutenção (listar, criar, editar e excluir);
- consulta de executores.

O login e o registro emitem access e refresh tokens. O frontend envia o access token nas requisições protegidas e tenta renová-lo automaticamente quando ele expira. O refresh token é rotacionado a cada renovação e o token anterior é invalidado.

## Arquitetura do backend

O fluxo principal de uma requisição segue estas camadas:

```text
Requisição HTTP
	↓
Controller
	↓
DTOs e validação
	↓
Service
	↓
Model / TypeORM
	↓
MySQL
```

Componentes compartilhados, como guards, decorators, filtros de exceção, constantes e interfaces, ficam em `backend/src/common/`. Configurações centrais, providers externos, estratégias de autenticação e templates ficam em `backend/src/core/`.

## Banco de dados

As principais tabelas atuais usam nomes físicos em português no MySQL:

- `usuarios`: usuários, perfis, credenciais e controle de versão da sessão;
- `locais`: locais de atendimento;
- `categorias`: categorias de manutenção;
- `requisicoes`: requisições, status, prioridade e dados de execução.

As propriedades TypeScript e os contratos HTTP continuam em inglês para preservar a compatibilidade com o frontend. Apenas os nomes físicos das tabelas e colunas do banco foram traduzidos.

Em um banco já existente, a alteração dos nomes requer uma migration ou a recriação do schema. Em desenvolvimento, `DB_SYNCHRONIZE=true` permite que o TypeORM sincronize o modelo configurado.

