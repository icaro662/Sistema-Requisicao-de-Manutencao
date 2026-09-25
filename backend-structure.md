# Estrutura do Backend - NestJS

## Configuração do projeto

```bash
npm install -g @nestjs/cli
nest new maintenance-system-api
cd maintenance-system-api

# Instalar dependências
npm install @nestjs/typeorm @nestjs/jwt @nestjs/passport typeorm mysql2 bcrypt multer
npm install -D @types/multer @types/bcrypt
```

## Estrutura de diretórios

A implementação usa uma organização de alto nível no estilo MVC. Os módulos Nest permanecem em
`src/modules/` como arquivos de composição, enquanto controladores, serviços, DTOs e
entidades são separados por responsabilidade:

```
src/
├── controllers/       # Controladores HTTP
├── services/          # Serviços da aplicação
├── dtos/<feature>/    # DTOs de requisição e resposta
├── entities/          # Entidades TypeORM
├── enums/             # Enums de domínio
├── guards/            # Guards Nest
├── strategies/        # Estratégias de autenticação
├── providers/         # Provedores de infraestrutura
├── templates/         # Templates de notificação
├── utils/             # Utilitários específicos das funcionalidades
├── modules/           # Apenas arquivos de composição dos módulos Nest
├── common/            # Código compartilhado entre funcionalidades
├── core/              # Configuração
├── config/            # Exemplos de ambiente
├── database/          # Migrações e seeds
├── app.module.ts
└── main.ts
```

A árvore detalhada por funcionalidade abaixo é mantida como referência de domínio; os
arquivos-fonte agora vivem nas pastas organizadas por responsabilidade acima.

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   ├── dtos/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   └── guards/
│   │       ├── jwt.guard.ts
│   │       └── roles.guard.ts
│   │
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── dtos/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── user.dto.ts
│   │   └── decorators/
│   │       ├── roles.decorator.ts
│   │       └── current-user.decorator.ts
│   │
│   ├── requisitions/
│   │   ├── requisitions.controller.ts
│   │   ├── requisitions.service.ts
│   │   ├── requisitions.module.ts
│   │   ├── entities/
│   │   │   ├── requisition.entity.ts
│   │   │   ├── requisition-history.entity.ts
│   │   │   └── requisition-attachment.entity.ts
│   │   ├── dtos/
│   │   │   ├── create-requisition.dto.ts
│   │   │   ├── update-requisition.dto.ts
│   │   │   ├── update-status.dto.ts
│   │   │   ├── register-execution.dto.ts
│   │   │   └── requisition.dto.ts
│   │   └── enums/
│   │       ├── status.enum.ts
│   │       └── priority.enum.ts
│   │
│   ├── locations/
│   │   ├── locations.controller.ts
│   │   ├── locations.service.ts
│   │   ├── locations.module.ts
│   │   ├── entities/
│   │   │   └── location.entity.ts
│   │   └── dtos/
│   │       ├── create-location.dto.ts
│   │       ├── update-location.dto.ts
│   │       └── location.dto.ts
│   │
│   ├── categories/
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   ├── categories.module.ts
│   │   ├── entities/
│   │   │   └── category.entity.ts
│   │   └── dtos/
│   │       ├── create-category.dto.ts
│   │       ├── update-category.dto.ts
│   │       └── category.dto.ts
│   │
│   ├── executors/
│   │   ├── executors.controller.ts
│   │   ├── executors.service.ts
│   │   ├── executors.module.ts
│   │   └── dtos/
│   │       ├── assign-executor.dto.ts
│   │       └── executor.dto.ts
│   │
│   ├── notifications/
│   │   ├── notifications.service.ts
│   │   ├── notifications.module.ts
│   │   ├── templates/
│   │   │   ├── email.template.ts
│   │   │   └── whatsapp.template.ts
│   │   └── providers/
│   │       ├── email.provider.ts
│   │       └── whatsapp.provider.ts
│   │
│   ├── dashboard/
│   │   ├── dashboard.controller.ts
│   │   ├── dashboard.service.ts
│   │   ├── dashboard.module.ts
│   │   └── dtos/
│   │       └── dashboard.dto.ts
│   │
│   ├── reports/
│   │   ├── reports.controller.ts
│   │   ├── reports.service.ts
│   │   ├── reports.module.ts
│   │   └── dtos/
│   │       ├── filter-report.dto.ts
│   │       └── report.dto.ts
│   │
│   ├── upload/
│   │   ├── upload.controller.ts
│   │   ├── upload.service.ts
│   │   ├── upload.module.ts
│   │   └── utils/
│   │       └── file-validation.ts
│   │
│   └── database/
│       ├── database.module.ts
│       ├── migrations/
│       └── seeds/
│
├── common/
│   ├── exceptions/
│   │   ├── http-exception.filter.ts
│   │   └── custom-exceptions.ts
│   ├── interfaces/
│   │   ├── request-user.interface.ts
│   │   └── pagination.interface.ts
│   ├── middleware/
│   │   ├── logger.middleware.ts
│   │   └── error-handling.middleware.ts
│   ├── decorators/
│   │   └── pagination.decorator.ts
│   ├── constants/
│   │   ├── messages.constants.ts
│   │   └── regex.constants.ts
│   └── utils/
│       ├── date.utils.ts
│       └── pagination.utils.ts
│
├── config/
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── mail.config.ts
│   └── multer.config.ts
│
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts

```

## Exemplos de arquivos principais

### 1. main.ts
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  
  app.enableCors();
  
  await app.listen(3000);
  console.log('API running on http://localhost:3000');
}

bootstrap();
```

### 2. app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth.module';
import { UsersModule } from './modules/users.module';
import { RequisitionsModule } from './modules/requisitions.module';
import { LocationsModule } from './modules/locations.module';
import { CategoriesModule } from './modules/categories.module';
import { ExecutorsModule } from './modules/executors.module';
import { NotificationsModule } from './modules/notifications.module';
import { DashboardModule } from './modules/dashboard.module';
import { ReportsModule } from './modules/reports.module';
import { UploadModule } from './modules/upload.module';
import { DatabaseModule } from './modules/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'maintenance_system',
      entities: ['src/**/*.entity.ts'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    UsersModule,
    RequisitionsModule,
    LocationsModule,
    CategoriesModule,
    ExecutorsModule,
    NotificationsModule,
    DashboardModule,
    ReportsModule,
    UploadModule,
    DatabaseModule,
  ],
})
export class AppModule {}
```

### 3. Entidade de requisição
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Location } from '../locations/entities/location.entity';
import { Category } from '../categories/entities/category.entity';
import { RequisitionHistoryEntity } from './requisition-history.entity';
import { RequisitionAttachmentEntity } from './requisition-attachment.entity';

export enum RequisitionStatus {
  OPEN = 'aberta',
  ANALYSIS = 'em_analise',
  IN_SERVICE = 'em_atendimento',
  AWAITING_MATERIAL = 'aguardando_material',
  COMPLETED = 'concluida',
  CANCELLED = 'cancelada',
}

export enum RequisitionPriority {
  LOW = 'baixa',
  MEDIUM = 'media',
  HIGH = 'alta',
  URGENT = 'urgente',
}

@Entity('requisitions')
export class RequisitionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  number: string;

  @ManyToOne(() => User)
  requester: User;

  @ManyToOne(() => User, { nullable: true })
  executor: User;

  @ManyToOne(() => User, { nullable: true })
  manager: User;

  @ManyToOne(() => User, { nullable: true })
  referent: User;

  @ManyToOne(() => Location)
  location: Location;

  @ManyToOne(() => Category)
  category: Category;

  @Column()
  description: string;

  @Column({ enum: RequisitionStatus, default: RequisitionStatus.OPEN })
  status: RequisitionStatus;

  @Column({ enum: RequisitionPriority, default: RequisitionPriority.MEDIUM })
  priority: RequisitionPriority;

  @Column()
  requesterEmail: string;

  @Column()
  requesterPhone: string;

  @Column({ nullable: true })
  requesterWhatsapp: string;

  @OneToMany(() => RequisitionAttachmentEntity, (attachment) => attachment.requisition, { eager: true })
  attachments: RequisitionAttachmentEntity[];

  @OneToMany(() => RequisitionHistoryEntity, (history) => history.requisition)
  history: RequisitionHistoryEntity[];

  @Column({ type: 'text', nullable: true })
  executionDescription: string;

  @Column({ nullable: true })
  executionDate: Date;

  @Column({ type: 'text', nullable: true })
  materialsUsed: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## Principais endpoints da API

### Autenticação
- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Cadastro do usuário
- `POST /auth/refresh` - Renovação do token JWT
- `POST /auth/logout` - Logout do usuário

### Requisições
- `POST /requisitions` - Criar nova requisição
- `GET /requisitions` - Listar requisições (com filtros)
- `GET /requisitions/:id` - Obter detalhes da requisição
- `PATCH /requisitions/:id/status` - Atualizar status
- `PATCH /requisitions/:id/assign-executor` - Atribuir executor
- `POST /requisitions/:id/execution` - Registrar execução
- `GET /requisitions/:id/history` - Obter histórico da requisição

### Usuários
- `GET /users` - Listar usuários
- `GET /users/:id` - Obter detalhes do usuário
- `POST /users` - Criar usuário (somente administrador)
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Excluir usuário

### Locais
- `GET /locations` - Listar locais
- `POST /locations` - Criar local
- `PATCH /locations/:id` - Atualizar local

### Categorias
- `GET /categories` - Listar categorias
- `POST /categories` - Criar categoria
- `PATCH /categories/:id` - Atualizar categoria

### Painel
- `GET /dashboard` - Obter indicadores do painel
- `GET /dashboard/requisitions-by-status` - Filtrar por status
- `GET /dashboard/requisitions-by-location` - Filtrar por local
- `GET /dashboard/requisitions-by-executor` - Filtrar por executor

### Relatórios
- `GET /reports/export-pdf` - Exportar relatório como PDF
- `GET /reports/export-excel` - Exportar relatório como Excel

### Envio de arquivos
- `POST /upload/photo` - Enviar foto da requisição
- `DELETE /upload/:filename` - Excluir arquivo enviado

