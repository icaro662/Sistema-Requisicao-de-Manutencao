import { DataSource } from 'typeorm';
import { Category } from '../../../models/category.entity';
import { Location } from '../../../models/location.entity';

export const LOCATIONS_SEED = [
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

export const CATEGORIES_SEED = [
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

export interface ReferenceDataResult {
  locationsCreated: number;
  categoriesCreated: number;
}

/** Garante que locais e categorias base existem (idempotente). */
export async function ensureReferenceData(dataSource: DataSource): Promise<ReferenceDataResult> {
  const locationsRepository = dataSource.getRepository(Location);
  const categoriesRepository = dataSource.getRepository(Category);
  let locationsCreated = 0;
  let categoriesCreated = 0;

  for (const location of LOCATIONS_SEED) {
    const exists = await locationsRepository.findOne({ where: { name: location.name } });
    if (!exists) {
      await locationsRepository.save(locationsRepository.create(location));
      locationsCreated += 1;
    }
  }

  for (const category of CATEGORIES_SEED) {
    const exists = await categoriesRepository.findOne({ where: { name: category.name } });
    if (!exists) {
      await categoriesRepository.save(categoriesRepository.create(category));
      categoriesCreated += 1;
    }
  }

  return { locationsCreated, categoriesCreated };
}
