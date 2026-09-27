import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

dotenv.config({ path: 'src/config/.env' });

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'maintenance_system',
  entities: [join(__dirname, '../../models/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
});

export default dataSource;
