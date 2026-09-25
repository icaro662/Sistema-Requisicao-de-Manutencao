# Schema do Banco de Dados e Arquitetura do Sistema

## Schema do banco de dados (MySQL)

### 1. Tabela de usuários
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('solicitante', 'executor', 'gestor', 'admin') NOT NULL DEFAULT 'solicitante',
  location_id VARCHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX (email),
  INDEX (role),
  INDEX (is_active)
);
```

### 2. Tabela de locais
```sql
CREATE TABLE locations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX (name)
);
```

### 3. Tabela de categorias
```sql
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX (name)
);
```

### 4. Tabela de requisições
```sql
CREATE TABLE requisitions (
  id VARCHAR(36) PRIMARY KEY,
  number VARCHAR(20) UNIQUE NOT NULL,
  requester_id VARCHAR(36) NOT NULL,
  executor_id VARCHAR(36),
  manager_id VARCHAR(36),
  referent_id VARCHAR(36),
  location_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  
  description LONGTEXT NOT NULL,
  status ENUM(
    'aberta',
    'em_analise',
    'em_atendimento',
    'aguardando_material',
    'concluida',
    'cancelada'
  ) DEFAULT 'aberta',
  priority ENUM('baixa', 'media', 'alta', 'urgente') DEFAULT 'media',
  
  requester_email VARCHAR(255) NOT NULL,
  requester_phone VARCHAR(20) NOT NULL,
  requester_whatsapp VARCHAR(20),
  
  execution_description LONGTEXT,
  execution_date DATETIME,
  materials_used LONGTEXT,
  observations LONGTEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (requester_id) REFERENCES users(id),
  FOREIGN KEY (executor_id) REFERENCES users(id),
  FOREIGN KEY (manager_id) REFERENCES users(id),
  FOREIGN KEY (referent_id) REFERENCES users(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  
  INDEX (number),
  INDEX (status),
  INDEX (priority),
  INDEX (requester_id),
  INDEX (executor_id),
  INDEX (location_id),
  INDEX (created_at),
  INDEX (status, priority)
);
```

### 5. Tabela de histórico de requisições
```sql
CREATE TABLE requisition_history (
  id VARCHAR(36) PRIMARY KEY,
  requisition_id VARCHAR(36) NOT NULL,
  action VARCHAR(255) NOT NULL,
  changed_by_id VARCHAR(36) NOT NULL,
  previous_value VARCHAR(255),
  new_value VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (requisition_id) REFERENCES requisitions(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by_id) REFERENCES users(id),
  
  INDEX (requisition_id),
  INDEX (timestamp),
  INDEX (changed_by_id)
);
```

### 6. Tabela de anexos de requisições
```sql
CREATE TABLE requisition_attachments (
  id VARCHAR(36) PRIMARY KEY,
  requisition_id VARCHAR(36) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  type ENUM('initial', 'execution') DEFAULT 'initial',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (requisition_id) REFERENCES requisitions(id) ON DELETE CASCADE,
  
  INDEX (requisition_id),
  INDEX (uploaded_at)
);
```

### 7. Tabela de notificações (opcional)
```sql
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  requisition_id VARCHAR(36),
  type ENUM('email', 'whatsapp', 'in_app') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message LONGTEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (requisition_id) REFERENCES requisitions(id) ON DELETE SET NULL,
  
  INDEX (user_id),
  INDEX (is_read),
  INDEX (created_at)
);
```

### 8. Tabela de registros de auditoria
```sql
CREATE TABLE audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  
  INDEX (user_id),
  INDEX (entity_type),
  INDEX (created_at)
);
```

## Arquitetura do sistema

### Arquitetura do backend (NestJS)

```
┌─────────────────────────────────────────┐
│         Requisição da API                │
└────────────────┬────────────────────────┘
                 │
         ┌───────▼────────┐
         │  MIDDLEWARE    │
         │  - Logger      │
         │  - Tratamento  │
         └───────┬────────┘
                 │
         ┌───────▼────────────────┐
         │   MANIPULADOR DE ROTA  │
         │   (Controladores)      │
         └───────┬────────────────┘
                 │
    ┌────────────┼────────────────┐
    │            │                │
┌───▼──┐  ┌──────▼──────┐  ┌──────▼──────┐
│Guard │  │ Interceptor │  │ Decorators  │
│ JWT  │  │ Transform.  │  │ Validação   │
└──────┘  └─────────────┘  └─────────────┘
    │            │                │
    └────────────┼────────────────┘
                 │
         ┌───────▼──────────────┐
         │   CAMADA DE SERVIÇOS │
         │  (Lógica de negócio) │
         │  - Requisição        │
         │  - Usuário           │
         │  - Notificação       │
         │  - Upload            │
         │  - Painel            │
         └───────┬──────────────┘
                 │
         ┌───────▼──────────────┐
         │   CAMADA DE REPOSITÓRIO │
         │   (TypeORM)             │
         │  - Acesso ao banco      │
         └───────┬──────────────┘
                 │
         ┌───────▼──────────────┐
         │   CAMADA DE BANCO     │
         │   (MySQL)            │
         └──────────────────────┘
```

### Arquitetura do frontend (React)

```
┌──────────────────────────────────┐
│      Navegador/Aplicação         │
└────────────┬─────────────────────┘
             │
      ┌──────▼────────┐
      │  App.tsx      │
      │  (Roteador)    │
      └──────┬────────┘
             │
    ┌────────┼────────┐
    │        │        │
 ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
 │Auth │ │Pág. │ │Admin│
 │Pág. │ │     │ │Pág. │
 └─────┘ └─────┘ └─────┘
    │        │        │
    └────────┼────────┘
             │
      ┌──────▼──────────────┐
      │   CAMADA DE COMPONENTES │
      │  - Comuns             │
      │  - Requisições        │
      │  - Painel             │
      │  - Administração      │
      └──────┬──────────────┘
             │
    ┌────────┼──────────────┐
    │        │              │
┌───▼──┐ ┌──▼──┐ ┌────────┐
│Hooks │ │Store│ │ Util.  │
└────┬─┘ └─────┘ └────────┘
     │
┌────▼──────────────┐
│  CAMADA DE SERVIÇOS │
│ - Chamadas à API    │
│ - Transformação     │
└────┬──────────────┘
     │
┌────▼──────────────┐
│   GERENCIAMENTO DE ESTADO │
│  (Zustand)        │
│  (React Query)    │
└────┬──────────────┘
     │
┌────▼──────────────┐
│   API (Backend)   │
└───────────────────┘
```

## Diagrama de fluxo de dados

### Criação de uma requisição

```
1. O usuário preenche o formulário no componente React
   │
   ├─ RequisitionForm.tsx
   │  └─ Gerenciamento de estado (useState)
   │
2. O botão de envio dispara a chamada à API
   │
   ├─ requisitionService.create()
   │  └─ POST /api/requisitions
   │
3. O backend recebe a requisição
   │
   ├─ RequisitionsController.create()
   │  ├─ Valida o token JWT
   │  ├─ Valida o perfil (Roles Guard)
   │  └─ Encaminha para o serviço
   │
4. Execução da lógica de negócio
   │
   ├─ RequisitionsService.create()
   │  ├─ Gera um número único para a requisição
   │  ├─ Cria a entidade
   │  ├─ Salva no banco de dados
   │  ├─ Cria uma entrada no histórico
   │  └─ Dispara uma notificação
   │
5. Notificação disparada
   │
   ├─ NotificationsService.notifyRequisitionCreated()
   │  ├─ Envia e-mail ao gestor/referente
   │  ├─ Coloca o trabalho de e-mail em fila
   │  └─ Retorna sucesso
   │
6. Resposta enviada ao frontend
   │
   ├─ { id, number, status, ... }
   │
7. O frontend é atualizado
   │
   ├─ O React Query invalida o cache
   ├─ O componente exibe uma mensagem de sucesso
   └─ Redireciona para os detalhes da requisição

```

### Atualização do status da requisição

```
1. O executor visualiza as requisições atribuídas
   │
   ├─ ExecutorRequisitionsPage.tsx
   │  └─ useRequisitions(filter)
   │
2. Clica no botão "Iniciar atendimento"
   │
   ├─ UpdateStatusDto = { status: 'em_atendimento' }
   │
3. Chamada do serviço para a API
   │
   ├─ PATCH /api/requisitions/:id/status
   │
4. Processamento no backend
   │
   ├─ RequisitionsController.updateStatus()
   │  ├─ Guards verificam JWT e perfil (executor, gestor, admin)
   │  └─ Usuário atual passado pelo decorator
   │
5. Camada de serviços
   │
   ├─ RequisitionsService.updateStatus()
   │  ├─ Recupera a requisição atual
   │  ├─ Valida a transição de status
   │  ├─ Atualiza o status
   │  ├─ Registra no RequisitionHistory
   │  └─ Dispara notificações
   │
6. Notificações
   │
   ├─ NotificationsService.notifyStatusChanged()
   │  ├─ Envia e-mail ao solicitante
   │  ├─ Envia e-mail ao gestor/referente
   │  └─ Envia WhatsApp ao solicitante (se habilitado)
   │
7. Registro de auditoria
   │
   ├─ Recorded in AuditLog table
   │  └─ User, action, timestamp, IP
   │
8. Resposta para o frontend
   │
   ├─ Updated requisition object
   │
9. Atualização do frontend
   │
   ├─ O React Query busca novamente os dados
   ├─ O componente é renderizado novamente
   └─ O usuário vê o novo status

```

## Fluxo de autenticação

```
┌──────────────────────┐
│   Login do usuário   │
│   (LoginPage.tsx)    │
└──────────┬───────────┘
           │
    ┌──────▼──────────┐
    │ POST /auth/login│
   │ { email, senha }│
    └──────┬──────────┘
           │
    ┌──────▼────────────────────┐
    │ AuthController.login()     │
   │ - Validar credenciais      │
   │ - Criar payload JWT        │
   │ - Gerar token de acesso    │
   │ - Gerar token de renovação │
    └──────┬────────────────────┘
           │
    ┌──────▼──────────────┐
   │ Resposta com tokens │
   │ + dados do usuário  │
    └──────┬──────────────┘
           │
    ┌──────▼────────────────────┐
    │ Frontend: useAuthStore     │
   │ - Salvar tokens no localStorage
   │ - Salvar usuário no estado    │
    └──────┬────────────────────┘
           │
    ┌──────▼────────────────────┐
   │ Chamadas seguintes à API   │
   │ - Interceptor Axios        │
   │ - Anexar JWT aos headers   │
    │ Authorization: Bearer JWT  │
    └──────┬────────────────────┘
           │
    ┌──────▼────────────────────┐
    │ Backend: JwtAuthGuard      │
   │ - Verificar assinatura     │
   │ - Verificar expiração      │
   │ - Extrair payload          │
    └──────┬────────────────────┘
           │
    ┌──────▼────────────────────┐
   │ RolesGuard (se necessário) │
   │ - Verificar perfil         │
   │ - Permitir/negar acesso    │
    └──────┬────────────────────┘
           │
    ┌──────▼────────────────────┐
   │ Prosseguir para a rota     │
    └────────────────────────────┘

Fluxo de renovação do token:
- Se o token de acesso expirar
- Usar o token de renovação para obter um novo par
- POST /auth/refresh { refreshToken }
- Obter novos tokens de acesso e renovação
- Atualizar o localStorage
- Repetir a requisição original
```

## Resumo da estrutura de pastas

### Backend
```
src/
├── modules/        # Arquivos de composição dos módulos Nest
├── controllers/    # Controladores HTTP
├── services/       # Serviços da aplicação
├── dtos/           # DTOs de requisição e resposta
├── entities/       # Entidades TypeORM
│   ├── auth/
│   ├── users/
│   ├── requisitions/
│   ├── locations/
│   ├── categories/
│   ├── executors/
│   ├── notifications/
│   ├── dashboard/
│   ├── reports/
│   ├── upload/
│   └── database/
├── common/         # Utilitários compartilhados
│   ├── exceptions/
│   ├── interfaces/
│   ├── middleware/
│   ├── decorators/
│   ├── constants/
│   └── utils/
├── config/         # Arquivos de configuração
├── app.module.ts
└── main.ts
```

### Frontend
```
src/
├── components/     # Componentes reutilizáveis
│   ├── common/
│   ├── auth/
│   ├── requisitions/
│   ├── dashboard/
│   ├── users/
│   ├── locations/
│   ├── categories/
│   └── modals/
├── pages/          # Componentes de página
│   ├── auth/
│   ├── requisitions/
│   ├── admin/
│   ├── manager/
│   ├── reports/
│   └── ...
├── hooks/          # Hooks personalizados
├── services/       # Serviços da API
├── store/          # Gerenciamento de estado
├── types/          # Tipos TypeScript
├── utils/          # Funções utilitárias
├── constants/      # Constantes
├── styles/         # Estilos globais
├── App.tsx
└── index.tsx
```

## Formato das respostas da API

### Resposta de sucesso
```json
{
  "data": {
    "id": "uuid",
    "number": "REQ-00001",
    "status": "aberta",
    "...": "..."
  },
   "message": "Requisição criada com sucesso",
  "timestamp": "2024-09-25T10:30:00Z"
}
```

### Resposta de erro
```json
{
  "error": "BadRequestException",
  "message": "Email já cadastrado",
  "statusCode": 400,
  "timestamp": "2024-09-25T10:30:00Z"
}
```

### Resposta paginada
```json
{
  "data": [
    { "id": "1", "number": "REQ-00001", "..." },
    { "id": "2", "number": "REQ-00002", "..." }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

## Implantação

### Backend (NestJS)
- Plataforma: Node.js (18+)
- Servidor: Express (integrado)
- Banco de dados: MySQL 8.0+
- Ambiente: contêiner Docker pronto para produção

### Frontend (React)
- Compilação: npm run build
- Plataforma: hospedagem estática (Vercel, Netlify, S3)
- CDN: CloudFlare ou similar
- Ambiente: processo de compilação baseado em Node

### Infraestrutura
- Gateway da API: Nginx ou AWS API Gateway
- Balanceador de carga: para escalabilidade do backend
- Banco de dados: MySQL com replicação
- Cache: Redis para sessões e dados
- Fila: Bull/Redis para tarefas assíncronas (e-mails, notificações)
- Armazenamento: S3 ou MinIO para fotos

