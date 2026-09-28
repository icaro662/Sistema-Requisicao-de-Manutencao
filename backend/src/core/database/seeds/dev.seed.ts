import { config } from 'dotenv';
import { resolve } from 'path';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { mkdirSync, writeFileSync } from 'node:fs';
import { User, UserRole } from '../../../models/user.entity';
import { Category } from '../../../models/category.entity';
import { Location } from '../../../models/location.entity';
import { Requisition } from '../../../models/requisition.entity';
import { HistoryAction, RequisitionHistory } from '../../../models/history.entity';
import { ExecutionRecord } from '../../../models/execution-record.entity';
import { RequestMaterial } from '../../../models/request-material.entity';
import { RequisitionPriority } from '../../enums/priority.enum';
import { RequisitionStatus } from '../../enums/status.enum';
import { statusLabel } from '../../enums/status-labels';
import { ensureReferenceData } from './reference-data';

config({ path: resolve(process.cwd(), 'src/config/.env') });

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'maintenance_system',
  entities: [
    User,
    Requisition,
    Category,
    Location,
    RequisitionHistory,
    ExecutionRecord,
    RequestMaterial,
  ],
  synchronize: process.env.DB_SYNCHRONIZE !== 'false',
});

interface DevUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

const MANAGER_EMAIL = 'gestor@dev.com';

const users: DevUser[] = [
  { name: 'Admin Dev', email: 'admin@dev.com', password: 'Admin@123', role: UserRole.ADMIN },
  { name: 'Gestor Dev', email: MANAGER_EMAIL, password: 'Gestor@123', role: UserRole.MANAGER, phone: '(11) 98888-1002' },
  { name: 'Executor Dev', email: 'executor@dev.com', password: 'Executor@123', role: UserRole.EXECUTOR, phone: '(11) 98888-1003' },
  { name: 'Rafael Prado', email: 'executor2@dev.com', password: 'Executor2@123', role: UserRole.EXECUTOR, phone: '(11) 98888-1004' },
  { name: 'Camila Nunes', email: 'executor3@dev.com', password: 'Executor3@123', role: UserRole.EXECUTOR, phone: '(11) 98888-1005' },
  { name: 'Solicitante Dev', email: 'solicitante@dev.com', password: 'Solicitante@123', role: UserRole.REQUESTER, phone: '(11) 98888-1006' },
  { name: 'Marina Alves', email: 'solicitante2@dev.com', password: 'Solicitante2@123', role: UserRole.REQUESTER, phone: '(11) 98888-1007' },
  { name: 'Paulo Cardoso', email: 'solicitante3@dev.com', password: 'Solicitante3@123', role: UserRole.REQUESTER, phone: '(11) 98888-1008' },
];

interface SeedRequisition {
  /** Descrição única: funciona como chave de idempotência do seed. */
  description: string;
  requesterEmail: string;
  locationName: string;
  categoryName: string;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  executorEmail?: string;
  /** A atribuição foi feita pelo próprio executor (botão "assumir"). */
  selfAssigned?: boolean;
  /** Idade da requisição, em dias, a partir da abertura. */
  openedDaysAgo: number;
  execution?: { description: string; materials?: string; observations?: string };
  materialNeeded?: { materials: string; reason: string };
  cancelReason?: string;
}

const REQUISITIONS_SEED: SeedRequisition[] = [
  {
    description: 'Tomada da sala de reunião solta e o projetor desliga sozinho',
    requesterEmail: 'solicitante2@dev.com',
    locationName: 'Sala 101',
    categoryName: 'Elétrica',
    priority: RequisitionPriority.HIGH,
    status: RequisitionStatus.OPEN,
    openedDaysAgo: 0.3,
  },
  {
    description: 'Torneira da pia da cozinha vazando sem parar',
    requesterEmail: 'solicitante3@dev.com',
    locationName: 'Cozinha',
    categoryName: 'Hidráulica',
    priority: RequisitionPriority.MEDIUM,
    status: RequisitionStatus.OPEN,
    openedDaysAgo: 1,
  },
  {
    description: 'Cadeira do ambiente do primeiro andar com a base quebrada',
    requesterEmail: 'solicitante@dev.com',
    locationName: 'Andar 1',
    categoryName: 'Mobiliário',
    priority: RequisitionPriority.LOW,
    status: RequisitionStatus.OPEN,
    openedDaysAgo: 2,
  },
  {
    description: 'Infiltração na parede do banheiro feminino com mancha de mofo',
    requesterEmail: 'solicitante2@dev.com',
    locationName: 'Banheiro feminino',
    categoryName: 'Estrutural',
    priority: RequisitionPriority.URGENT,
    status: RequisitionStatus.OPEN,
    openedDaysAgo: 0.15,
  },
  {
    description: 'Monitor da estação de trabalho da sala de TI não liga',
    requesterEmail: 'solicitante3@dev.com',
    locationName: 'Sala 202',
    categoryName: 'Eletrônicos',
    priority: RequisitionPriority.HIGH,
    status: RequisitionStatus.ANALYSIS,
    openedDaysAgo: 3,
  },
  {
    description: 'Quadro de energia do subsolo desarmando com frequência',
    requesterEmail: 'solicitante3@dev.com',
    locationName: 'Subsolo',
    categoryName: 'Elétrica',
    priority: RequisitionPriority.URGENT,
    status: RequisitionStatus.IN_SERVICE,
    executorEmail: 'executor@dev.com',
    openedDaysAgo: 2,
  },
  {
    description: 'Ar-condicionado da sala da diretoria não está gelando',
    requesterEmail: 'solicitante@dev.com',
    locationName: 'Sala 301',
    categoryName: 'Ar-condicionado',
    priority: RequisitionPriority.MEDIUM,
    status: RequisitionStatus.IN_SERVICE,
    executorEmail: 'executor2@dev.com',
    selfAssigned: true,
    openedDaysAgo: 4,
  },
  {
    description: 'Vazamento constante no mictório do banheiro masculino',
    requesterEmail: 'solicitante2@dev.com',
    locationName: 'Banheiro masculino',
    categoryName: 'Hidráulica',
    priority: RequisitionPriority.HIGH,
    status: RequisitionStatus.IN_SERVICE,
    executorEmail: 'executor3@dev.com',
    openedDaysAgo: 1.5,
  },
  {
    description: 'Pintura descascando na parede da recepção do térreo',
    requesterEmail: 'solicitante3@dev.com',
    locationName: 'Térreo',
    categoryName: 'Pintura',
    priority: RequisitionPriority.MEDIUM,
    status: RequisitionStatus.AWAITING_MATERIAL,
    executorEmail: 'executor2@dev.com',
    openedDaysAgo: 6,
    materialNeeded: {
      materials: 'Tinta acrílica branca (18L), rolo e fita de mascaramento',
      reason: 'Estoque de tinta da cor padrão esgotado',
    },
  },
  {
    description: 'Limpeza especial do tapete da sala de reunião',
    requesterEmail: 'solicitante2@dev.com',
    locationName: 'Sala 101',
    categoryName: 'Limpeza',
    priority: RequisitionPriority.MEDIUM,
    status: RequisitionStatus.COMPLETED,
    executorEmail: 'executor@dev.com',
    openedDaysAgo: 8,
    execution: {
      description: 'Tapete higienizado com extratora e liberado após secagem completa',
      materials: 'Detergente neutro, produto enzimático e absorvente',
      observations: 'Executado fora do horário de reuniões para não interromper o andar',
    },
  },
  {
    description: 'Fechadura da porta de acesso do primeiro andar travando',
    requesterEmail: 'solicitante@dev.com',
    locationName: 'Andar 1',
    categoryName: 'Segurança',
    priority: RequisitionPriority.HIGH,
    status: RequisitionStatus.COMPLETED,
    executorEmail: 'executor3@dev.com',
    openedDaysAgo: 12,
    execution: {
      description: 'Cilindro substituído e teste de abertura com todas as chaves do andar',
      materials: '1 cilindro de segurança, 6 chaves codificadas',
      observations: 'Chaves entregues à recepção com registro no log de acesso',
    },
  },
  {
    description: 'Repintagem completa da sala 101',
    requesterEmail: 'solicitante3@dev.com',
    locationName: 'Sala 101',
    categoryName: 'Pintura',
    priority: RequisitionPriority.LOW,
    status: RequisitionStatus.CANCELLED,
    openedDaysAgo: 10,
    cancelReason: 'Solicitante adiou a obra para o próximo trimestre',
  },
];

const HOUR_MS = 60 * 60 * 1000;

interface HistoryPlan {
  userId: string | null;
  userName: string;
  action: HistoryAction;
  description: string;
  previousStatus?: RequisitionStatus | null;
  newStatus?: RequisitionStatus | null;
  createdAt: Date;
}

interface ExecutionPlan {
  executorId: string;
  executorName: string;
  executionDescription: string;
  serviceDate: Date;
  materialsUsed: string | null;
  observations: string | null;
}

interface MaterialPlan {
  materialsNeeded: string;
  reason: string;
  createdAt: Date;
}

interface RequisitionPlan {
  id: string;
  number: string;
  requesterId: string;
  locationId: string;
  categoryId: string;
  description: string;
  status: RequisitionStatus;
  priority: RequisitionPriority;
  requesterEmail: string;
  requesterPhone: string;
  executorId: string | null;
  executionDescription: string | null;
  executionDate: Date | null;
  materialsUsed: string | null;
  observations: string | null;
  createdAt: Date;
  history: HistoryPlan[];
  execution?: ExecutionPlan;
  material?: MaterialPlan;
}

async function seedDevUsers(): Promise<Map<string, User>> {
  const usersRepository = dataSource.getRepository(User);
  const usersByEmail = new Map<string, User>();

  for (const user of users) {
    const existing = await usersRepository.findOne({ where: { email: user.email } });

    if (existing) {
      usersByEmail.set(user.email, existing);
      continue;
    }

    const saved = await usersRepository.save(usersRepository.create({
      name: user.name,
      email: user.email,
      password: await hash(user.password, 12),
      phone: user.phone ?? null,
      role: user.role,
      isActive: true,
      locationId: null,
      tokenVersion: 0,
    }));

    usersByEmail.set(user.email, saved);
  }

  return usersByEmail;
}

function daysAgo(days: number, now: number): Date {
  return new Date(now - days * 24 * HOUR_MS);
}

/**
 * Monta o plano de uma requisição de demonstração: registro principal,
 * linha do tempo do histórico e, quando aplicável, execução e material.
 */
function buildPlan(
  spec: SeedRequisition,
  number: string,
  now: number,
  people: { requester: User; executor?: User; manager: User },
  references: { location: Location; category: Category },
): RequisitionPlan {
  const id = randomUUID();
  const openedAt = daysAgo(spec.openedDaysAgo, now);
  const history: HistoryPlan[] = [];
  let cursor = openedAt;

  const advance = (gapHours: number): Date => {
    cursor = new Date(Math.min(cursor.getTime() + gapHours * HOUR_MS, now));
    return cursor;
  };

  const requireUser = (user: User | undefined, email: string): User => {
    if (!user) throw new Error(`Usuário do seed não encontrado: ${email}`);
    return user;
  };

  const executor = spec.executorEmail
    ? requireUser(people.executor, spec.executorEmail)
    : undefined;

  history.push({
    userId: people.requester.id,
    userName: people.requester.name,
    action: HistoryAction.CREATED,
    description: `Requisição ${number} criada e aberta`,
    newStatus: RequisitionStatus.OPEN,
    createdAt: cursor,
  });

  if (executor) {
    advance(6);
    const selfAssigned = Boolean(spec.selfAssigned);
    history.push({
      userId: selfAssigned ? executor.id : people.manager.id,
      userName: selfAssigned ? executor.name : people.manager.name,
      action: HistoryAction.EXECUTOR_ASSIGNED,
      description: selfAssigned
        ? `Executor ${executor.name} assumiu o atendimento`
        : `Executor ${executor.name} atribuído à requisição`,
      previousStatus: RequisitionStatus.OPEN,
      newStatus: RequisitionStatus.IN_SERVICE,
      createdAt: cursor,
    });
  }

  if (spec.status === RequisitionStatus.ANALYSIS) {
    advance(3);
    history.push({
      userId: people.manager.id,
      userName: people.manager.name,
      action: HistoryAction.STATUS_CHANGED,
      description: `Status alterado de "${statusLabel(RequisitionStatus.OPEN)}" para "${statusLabel(RequisitionStatus.ANALYSIS)}"`,
      previousStatus: RequisitionStatus.OPEN,
      newStatus: RequisitionStatus.ANALYSIS,
      createdAt: cursor,
    });
  }

  if (spec.status === RequisitionStatus.AWAITING_MATERIAL && executor && spec.materialNeeded) {
    advance(12);
    history.push({
      userId: executor.id,
      userName: executor.name,
      action: HistoryAction.STATUS_CHANGED,
      description: `Status alterado de "${statusLabel(RequisitionStatus.IN_SERVICE)}" para "${statusLabel(RequisitionStatus.AWAITING_MATERIAL)}"`,
      previousStatus: RequisitionStatus.IN_SERVICE,
      newStatus: RequisitionStatus.AWAITING_MATERIAL,
      createdAt: cursor,
    });
    advance(2);
    history.push({
      userId: executor.id,
      userName: executor.name,
      action: HistoryAction.MATERIAL_REQUESTED,
      description: `Material solicitado: ${spec.materialNeeded.materials}`,
      createdAt: cursor,
    });
  }

  let execution: ExecutionPlan | undefined;
  if (spec.status === RequisitionStatus.COMPLETED && executor && spec.execution) {
    advance(24);
    execution = {
      executorId: executor.id,
      executorName: executor.name,
      executionDescription: spec.execution.description,
      serviceDate: cursor,
      materialsUsed: spec.execution.materials ?? null,
      observations: spec.execution.observations ?? null,
    };
    history.push({
      userId: executor.id,
      userName: executor.name,
      action: HistoryAction.EXECUTION_REGISTERED,
      description: `Registro de execução salvo: ${spec.execution.description}`,
      previousStatus: RequisitionStatus.IN_SERVICE,
      newStatus: RequisitionStatus.COMPLETED,
      createdAt: cursor,
    });
  }

  if (spec.status === RequisitionStatus.CANCELLED) {
    advance(8);
    history.push({
      userId: people.manager.id,
      userName: people.manager.name,
      action: HistoryAction.CANCELLED,
      description: spec.cancelReason
        ? `Requisição encerrada sem conclusão: ${spec.cancelReason}`
        : 'Requisição encerrada sem conclusão',
      previousStatus: RequisitionStatus.OPEN,
      newStatus: RequisitionStatus.CANCELLED,
      createdAt: cursor,
    });
  }

  const material: MaterialPlan | undefined = spec.materialNeeded
    ? {
        materialsNeeded: spec.materialNeeded.materials,
        reason: spec.materialNeeded.reason,
        createdAt: cursor,
      }
    : undefined;

  return {
    id,
    number,
    requesterId: people.requester.id,
    locationId: references.location.id,
    categoryId: references.category.id,
    description: spec.description,
    status: spec.status,
    priority: spec.priority,
    requesterEmail: spec.requesterEmail,
    requesterPhone: people.requester.phone ?? '(11) 99999-0000',
    executorId: executor?.id ?? null,
    executionDescription: execution?.executionDescription ?? null,
    executionDate: execution?.serviceDate ?? null,
    materialsUsed: execution?.materialsUsed ?? null,
    observations: execution?.observations ?? null,
    createdAt: openedAt,
    history,
    execution,
    material,
  };
}

async function insertPlan(plan: RequisitionPlan): Promise<void> {
  await dataSource.createQueryBuilder().insert().into(Requisition).values({
    id: plan.id,
    number: plan.number,
    requesterId: plan.requesterId,
    locationId: plan.locationId,
    categoryId: plan.categoryId,
    description: plan.description,
    status: plan.status,
    priority: plan.priority,
    requesterEmail: plan.requesterEmail,
    requesterPhone: plan.requesterPhone,
    executorId: plan.executorId,
    executionDescription: plan.executionDescription,
    executionDate: plan.executionDate,
    materialsUsed: plan.materialsUsed,
    observations: plan.observations,
    createdAt: plan.createdAt,
    updatedAt: plan.createdAt,
  }).execute();

  for (const entry of plan.history) {
    await dataSource.createQueryBuilder().insert().into(RequisitionHistory).values({
      requisitionId: plan.id,
      userId: entry.userId,
      userName: entry.userName,
      action: entry.action,
      description: entry.description,
      previousStatus: entry.previousStatus ?? null,
      newStatus: entry.newStatus ?? null,
      referenceId: null,
      createdAt: entry.createdAt,
      updatedAt: entry.createdAt,
    }).execute();
  }

  if (plan.execution) {
    await dataSource.createQueryBuilder().insert().into(ExecutionRecord).values({
      requisitionId: plan.id,
      executorId: plan.execution.executorId,
      executorName: plan.execution.executorName,
      executionDescription: plan.execution.executionDescription,
      serviceDate: plan.execution.serviceDate,
      materialsUsed: plan.execution.materialsUsed,
      observations: plan.execution.observations,
      photoUrl: null,
      createdAt: plan.execution.serviceDate,
      updatedAt: plan.execution.serviceDate,
    }).execute();
  }

  if (plan.material) {
    await dataSource.createQueryBuilder().insert().into(RequestMaterial).values({
      requisitionId: plan.id,
      materialsNeeded: plan.material.materialsNeeded,
      reason: plan.material.reason,
      createdAt: plan.material.createdAt,
      updatedAt: plan.material.createdAt,
    }).execute();
  }
}

async function seedRequisitions(usersByEmail: Map<string, User>): Promise<void> {
  const requisitionsRepository = dataSource.getRepository(Requisition);
  const locationsRepository = dataSource.getRepository(Location);
  const categoriesRepository = dataSource.getRepository(Category);

  const locations = new Map((await locationsRepository.find()).map((item) => [item.name, item]));
  const categories = new Map((await categoriesRepository.find()).map((item) => [item.name, item]));

  const manager = usersByEmail.get(MANAGER_EMAIL);
  if (!manager) throw new Error(`Usuário do seed não encontrado: ${MANAGER_EMAIL}`);

  let nextNumber = (await requisitionsRepository.count()) + 1;
  let created = 0;
  let skipped = 0;

  console.log('\nRequisições de demonstração:');

  for (const spec of REQUISITIONS_SEED) {
    const alreadyExists = await requisitionsRepository.findOne({ where: { description: spec.description } });
    if (alreadyExists) {
      skipped += 1;
      continue;
    }

    const requester = usersByEmail.get(spec.requesterEmail);
    const executor = spec.executorEmail ? usersByEmail.get(spec.executorEmail) : undefined;
    const location = locations.get(spec.locationName);
    const category = categories.get(spec.categoryName);

    if (!requester) throw new Error(`Usuário do seed não encontrado: ${spec.requesterEmail}`);
    if (spec.executorEmail && !executor) throw new Error(`Usuário do seed não encontrado: ${spec.executorEmail}`);
    if (!location) throw new Error(`Local do seed não encontrado: ${spec.locationName}`);
    if (!category) throw new Error(`Categoria do seed não encontrada: ${spec.categoryName}`);

    const number = `REQ-${String(nextNumber).padStart(5, '0')}`;
    nextNumber += 1;

    const plan = buildPlan(spec, number, Date.now(), {
      requester,
      executor,
      manager,
    }, { location, category });

    await insertPlan(plan);
    created += 1;

    console.log(
      `  ${plan.number}  ${plan.status.padEnd(19)} ${spec.requesterEmail.padEnd(24)} → ${spec.executorEmail ?? '(sem executor)'}`,
    );
  }

  console.log(`\n${created} requisições criadas, ${skipped} já existentes (${REQUISITIONS_SEED.length} no total do seed).`);
}

function writeCredentials(): void {
  const tmpDir = resolve(process.cwd(), 'tmp');
  mkdirSync(tmpDir, { recursive: true });

  const credentials = users.map((u) => `${u.role}: ${u.email} / ${u.password}`).join('\n');
  writeFileSync(resolve(tmpDir, 'dev-credentials.txt'), credentials, 'utf-8');
}

async function seedDev(): Promise<void> {
  await dataSource.initialize();

  const usersByEmail = await seedDevUsers();
  const reference = await ensureReferenceData(dataSource);
  await seedRequisitions(usersByEmail);
  writeCredentials();

  console.log('\n========================================');
  console.log('Dev seed finished!');
  console.log('========================================');
  console.log(`${users.length} usuários, ${reference.locationsCreated} locais novos, ${reference.categoriesCreated} categorias novas.`);
  console.log('Credentials written to: tmp/dev-credentials.txt');
  console.log('\nLogins:');
  users.forEach((u) => console.log(`  ${u.role}: ${u.email} / ${u.password}`));
  console.log('========================================\n');
}

seedDev()
  .catch((error: unknown) => {
    console.error('Não foi possível executar o seed de dev.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) await dataSource.destroy();
  });
