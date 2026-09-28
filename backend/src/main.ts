import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'node:path';
import express from 'express';
import { AppModule } from './app.module';

dotenvConfig({ path: join(process.cwd(), 'src/config/.env') });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.getHttpAdapter().getInstance().use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  // O HttpExceptionFilter é registrado no AppModule (APP_FILTER) para que
  // injete o HistoryService e audite as operações que falham.

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`Maintenance API running.\n
HealthCheck endpoint on: http://localhost:${port}/api/health`);
}

void bootstrap();
