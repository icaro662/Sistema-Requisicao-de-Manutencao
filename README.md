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

# SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@maintenance.com
FRONTEND_URL=http://localhost:5173
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

### 5.1 Seed de desenvolvimento (dados de demonstração)

```bash
npm run seed:dev
```

Também é **idempotente** (registros já existentes são ignorados) e popula o ambiente local:

| Item | Descrição |
|------|-----------|
| **Usuários de dev** | 8 usuários: admin, gestor, 3 executores e 3 solicitantes |
| **Locais e categorias** | Garante os mesmos dados de referência do `npm run seed` |
| **12 requisições** | Abertas por solicitantes diferentes e atribuídas a executores diferentes, cobrindo todos os status: `aberta`, `em_analise`, `em_atendimento`, `aguardando_material`, `concluida` e `cancelada` |
| **Linha do tempo** | Histórico de cada requisição (criação, atribuição, mudanças de status, execução e cancelamento), com data e responsável |
| **Execuções e materiais** | Registros de execução das requisições concluídas e uma solicitação de material pendente |

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

## Comandos úteis

### Backend

```bash
npm run start       # Inicia a API normalmente
npm run start:dev   # Inicia a API com watch mode
npm run build       # Compila o backend
npm run seed        # Cria o administrador inicial e exibe as credenciais
npm run seed:dev    # Cria usuários, requisições e histórico de demonstração
npm run start:prod  # Executa a versão compilada
npm run lint        # Executa o ESLint com correção automática
```

### Frontend

```bash
npm run dev         # Inicia o servidor Vite
npm run build       # Verifica os tipos e gera o build de produção
npm run preview     # Serve o build localmente para validação
```
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
- histórico de alterações das requisições (quem, o quê e quando) com linha do tempo visual;
- log de auditoria do sistema (quem, o quê, quando e resultado) com filtros por usuário, data, ação, objeto e resultado;
- visualização do histórico completo de uma requisição a partir da auditoria;
- registro de execução pelo executor (descrição, materiais, observações e foto);
- finalização e encerramento de requisições;
- visualização das fotos registradas antes e depois da manutenção;
- consulta de usuários;
- cadastro de locais (listar, criar, editar e excluir);
- cadastro de categorias de manutenção (listar, criar, editar e excluir);
- consulta de executores.

## Auditoria

A tabela `historico_alteracoes` é o log de auditoria do sistema. Cada registro responde às quatro perguntas do checklist:

| Pergunta | Colunas |
| --- | --- |
| Quem | `usuario_id` e `usuario_nome` |
| O quê | `acao` e `descricao` |
| Quando | `criado_em` |
| Resultado | `resultado` (`sucesso`/`falha`) e `resultado_detalhe` |

O objeto auditado fica em `entidade` (`requisicao`, `usuario`, `local`, `categoria` ou `sistema`) com `entidade_id`. Eventos de requisição também mantêm `requisicao_id` preenchido, o que alimenta a linha do tempo da própria requisição.

O que é auditado:

- requisições: criação, edição, alteração de status, atribuição de executor, registro de execução, observação, solicitação de material, finalização e cancelamento;
- usuários: criação (inclusive cadastro público), atualização (com o detalhe do que mudou, ex.: `perfil de executor para gestor`) e redefinição de senha;
- locais e categorias: criação, atualização e exclusão;
- operações com erro: o filtro global de exceções registra `Falha em <MÉTODO> <rota> (HTTP <status>): <mensagem>` com `resultado = falha` nas requisições autenticadas.

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
- `requisicoes`: requisições, status, prioridade e dados de execução;
- `historico_alteracoes`: log de auditoria do sistema (quem, o quê, quando e resultado), com o objeto auditado (`entidade`/`entidade_id`) e a ligação opcional com a requisição (`requisicao_id`);
- `registros_execucao`: registros de execução salvos pelo executor;
- `materiais_solicitacao`: materiais solicitados durante o atendimento.

Em um banco já existente, a alteração dos nomes requer uma migration ou a recriação do schema. Em desenvolvimento, `DB_SYNCHRONIZE=true` permite que o TypeORM sincronize o modelo configurado.

