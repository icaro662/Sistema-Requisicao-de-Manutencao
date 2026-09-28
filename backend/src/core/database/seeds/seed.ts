import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { Category } from '../../../models/category.entity';
import { Location } from '../../../models/location.entity';
import { Requisition } from '../../../models/requisition.entity';
import { User, UserRole } from '../../../models/user.entity';
import {
  CATEGORIES_SEED,
  LOCATIONS_SEED,
  ensureReferenceData,
} from './reference-data';

config({ path: resolve(process.cwd(), 'src/config/.env') });

const ADMIN_EMAIL = 'admin@empresa.com';
const ADMIN_PASSWORD = 'Admin@123';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'maintenance_system',
  entities: [User, Requisition, Category, Location],
  synchronize: process.env.DB_SYNCHRONIZE !== 'false',
});

async function seedAdmin(): Promise<void> {
  await dataSource.initialize();
  const usersRepository = dataSource.getRepository(User);
  const existingAdmin = await usersRepository.findOne({ where: { email: ADMIN_EMAIL } });

  if (existingAdmin) {
    if (existingAdmin.role !== UserRole.ADMIN) {
      throw new Error(`O e-mail ${ADMIN_EMAIL} já pertence a um usuário que não é administrador.`);
    }

    console.log('Administrador inicial já existe. A senha atual não foi alterada.');
    console.log(`E-mail: ${ADMIN_EMAIL}`);
    console.log('Use a senha definida pelo administrador.');
  } else {
    await usersRepository.save(usersRepository.create({
      name: 'Administrador',
      email: ADMIN_EMAIL,
      password: await hash(ADMIN_PASSWORD, 12),
      phone: null,
      role: UserRole.ADMIN,
      locationId: null,
      isActive: true,
      tokenVersion: 0,
    }));

    console.log('\nAdministrador inicial criado com sucesso.');
    console.log('=====================================');
    console.log(`E-mail: ${ADMIN_EMAIL}`);
    console.log(`Senha: ${ADMIN_PASSWORD}`);
    console.log('Altere essa senha após o primeiro login.');
    console.log('=====================================\n');
  }

  // Seed locations and categories
  const reference = await ensureReferenceData(dataSource);
  console.log(`${LOCATIONS_SEED.length} locais populados (${reference.locationsCreated} novos).`);
  console.log(`${CATEGORIES_SEED.length} categorias populadas (${reference.categoriesCreated} novas).`);
}

seedAdmin()
  .catch((error: unknown) => {
    console.error('Não foi possível executar o seed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) await dataSource.destroy();
  });
