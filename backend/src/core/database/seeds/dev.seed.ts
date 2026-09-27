import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { mkdirSync, writeFileSync } from 'node:fs';
import { User, UserRole } from '../../../models/user.entity';
import { Category } from '../../../models/category.entity';
import { Location } from '../../../models/location.entity';
import { Requisition } from '../../../models/requisition.entity';

config({ path: resolve(process.cwd(), 'src/config/.env') });

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

const users = [
  { name: 'Admin Dev', email: 'admin@dev.com', password: 'Admin@123', role: UserRole.ADMIN },
  { name: 'Gestor Dev', email: 'gestor@dev.com', password: 'Gestor@123', role: UserRole.MANAGER },
  { name: 'Executor Dev', email: 'executor@dev.com', password: 'Executor@123', role: UserRole.EXECUTOR },
  { name: 'Solicitante Dev', email: 'solicitante@dev.com', password: 'Solicitante@123', role: UserRole.REQUESTER },
];

async function seedDevUsers(): Promise<void> {
  await dataSource.initialize();
  const usersRepository = dataSource.getRepository(User);

  for (const user of users) {
    const existing = await usersRepository.findOne({ where: { email: user.email } });
    if (!existing) {
      await usersRepository.save(usersRepository.create({
        name: user.name,
        email: user.email,
        password: await hash(user.password, 12),
        phone: null,
        role: user.role,
        isActive: true,
        locationId: null,
        tokenVersion: 0,
      }));
    }
  }

  // Write credentials to tmp folder
  const tmpDir = resolve(process.cwd(), 'tmp');
  mkdirSync(tmpDir, { recursive: true });

  const credentials = users.map((u) => `${u.role}: ${u.email} / ${u.password}`).join('\n');
  writeFileSync(resolve(tmpDir, 'dev-credentials.txt'), credentials, 'utf-8');

  console.log('\n========================================');
  console.log('Dev users seeded successfully!');
  console.log('========================================');
  console.log('Credentials written to: tmp/dev-credentials.txt');
  console.log('\nLogins:');
  users.forEach((u) => console.log(`  ${u.role}: ${u.email} / ${u.password}`));
  console.log('========================================\n');
}

seedDevUsers()
  .catch((error: unknown) => {
    console.error('Não foi possível executar o seed de dev.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) await dataSource.destroy();
  });
