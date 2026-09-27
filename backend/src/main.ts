import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'node:path';
import express from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';

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
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`Maintenance API running.\n
HealthCheck endpoint on: http://localhost:${port}/api/health`);
}

void bootstrap();
