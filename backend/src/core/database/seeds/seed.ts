import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { Category } from '../../../models/category.entity';
import { Location } from '../../../models/location.entity';
import { Requisition } from '../../../models/requisition.entity';
import { User, UserRole } from '../../../models/user.entity';

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

const LOCATIONS_SEED = [
  { name: 'Sala 101', description: 'Sala de reuniões — térreo' },
  { name: 'Sala 102', description: 'Sala de treinamento — térreo' },
  { name: 'Sala 201', description: 'Sala de escritório — primeiro andar' },
  { name: 'Sala 202', description: 'Sala de TI — primeiro andar' },
  { name: 'Sala 301', description: 'Sala de diretoria — segundo andar' },
  { name: 'Andar 1', description: 'Primeiro andar — áreas comuns' },
  { name: 'Andar 2', description: 'Segundo andar — áreas comuns' },
  { name: 'Térreo', description: 'Térreo — recepção e áreas comuns' },
  { name: 'Subsolo', description: 'Subsolo — estacionamento e depósito' },
  { name: 'Cozinha', description: 'Cozinha — preparo de alimentos' },
  { name: 'Banheiro masculino', description: 'Banheiro masculino — todos os andares' },
  { name: 'Banheiro feminino', description: 'Banheiro feminino — todos os andares' },
];

const CATEGORIES_SEED = [
  { name: 'Elétrica', description: 'Problemas elétricos como fiação, tomadas, disjuntores, iluminação e quadros de energia' },
  { name: 'Hidráulica', description: 'Problemas hidráulicos como vazamentos, torneiras, encanamento e esgoto' },
  { name: 'Mobiliário', description: 'Troca ou reparo de móveis como cadeiras, mesas, armários, estantes e bancos' },
  { name: 'Eletrônicos', description: 'Problemas com equipamentos eletrônicos como computadores, impressoras, projetores e monitores' },
  { name: 'Ar-condicionado', description: 'Manutenção e reparo de sistemas de climatização e ventilação' },
  { name: 'Pintura', description: 'Pintura de paredes, portas, janelas e superfícies em geral' },
  { name: 'Estrutural', description: 'Reparos estruturais como rachaduras, infiltrações, pisos e tetos' },
  { name: 'Limpeza', description: 'Serviços de limpeza geral ou específica de ambientes' },
  { name: 'Jardinagem', description: 'Corte de grama, poda, plantio e manutenção de áreas verdes' },
  { name: 'Segurança', description: 'Problemas com fechaduras, câceras, alarmes e sistemas de segurança' },
];

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

  // Seed locations
  const locationsRepository = dataSource.getRepository(Location);
  for (const location of LOCATIONS_SEED) {
    const exists = await locationsRepository.findOne({ where: { name: location.name } });
    if (!exists) {
      await locationsRepository.save(locationsRepository.create(location));
    }
  }
  console.log(`${LOCATIONS_SEED.length} locais populados.`);

  // Seed categories
  const categoriesRepository = dataSource.getRepository(Category);
  for (const category of CATEGORIES_SEED) {
    const exists = await categoriesRepository.findOne({ where: { name: category.name } });
    if (!exists) {
      await categoriesRepository.save(categoriesRepository.create(category));
    }
  }
  console.log(`${CATEGORIES_SEED.length} categorias populadas.`);
}

seedAdmin()
  .catch((error: unknown) => {
    console.error('Não foi possível executar o seed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) await dataSource.destroy();
  });
