import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth.module';
import { CategoriesModule } from './modules/categories.module';
import { DashboardModule } from './modules/dashboard.module';
import { DatabaseModule } from './modules/database.module';
import { ExecutionRecordsModule } from './modules/execution-records.module';
import { ExecutorsModule } from './modules/executors.module';
import { LocationsModule } from './modules/locations.module';
import { NotificationsModule } from './modules/notifications.module';
import { ReportsModule } from './modules/reports.module';
import { RequestMaterialModule } from './modules/request-material.module';
import { RequisitionsModule } from './modules/requisitions.module';
import { UploadModule } from './modules/upload.module';
import { UsersModule } from './modules/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: join(process.cwd(), 'src/config/.env'),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'maintenance_system'),
        autoLoadEntities: true,
        migrations: [join(__dirname, 'core/database/migrations/*{.ts,.js}')],
        migrationsRun: false,
        synchronize: config.get<string>(
          'DB_SYNCHRONIZE',
          config.get<string>('NODE_ENV', 'development') === 'production' ? 'false' : 'true',
        ) === 'true',
        logging: config.get<string>('NODE_ENV') !== 'production',        
      }),
    }),
    AuthModule,
    UsersModule,
    RequisitionsModule,
    LocationsModule,
    CategoriesModule,
    ExecutorsModule,
    ExecutionRecordsModule,
    NotificationsModule,
    DashboardModule,
    ReportsModule,
    UploadModule,
    DatabaseModule,
    RequestMaterialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
