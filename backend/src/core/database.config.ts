export default () => ({ database: { host: process.env.DB_HOST ?? 'localhost', port: Number(process.env.DB_PORT ?? 3306), name: process.env.DB_NAME ?? 'maintenance_system' } });
