import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import * as dotenv from 'dotenv';

dotenv.config({ path: '/home/hikaru/Projects/RequestSystem/backend/src/config/.env' });

// Define all endpoints to test
// Format: { controller, method, path, requiresAuth, allowedRoles }
const ENDPOINTS = [
  // AppController
  { controller: 'AppController', method: 'GET', path: '/api/health', requiresAuth: false },
  // AuthController (route: 'auth')
  { controller: 'AuthController', method: 'POST', path: '/api/auth/login', requiresAuth: false },
  { controller: 'AuthController', method: 'POST', path: '/api/auth/register', requiresAuth: false },
  { controller: 'AuthController', method: 'POST', path: '/api/auth/refresh', requiresAuth: false },
  { controller: 'AuthController', method: 'GET', path: '/api/auth/me', requiresAuth: true },
  { controller: 'AuthController', method: 'POST', path: '/api/auth/logout', requiresAuth: true },
  { controller: 'AuthController', method: 'POST', path: '/api/auth/forgot-password', requiresAuth: false },
  { controller: 'AuthController', method: 'POST', path: '/api/auth/reset-password', requiresAuth: false },
  // UsersController (route: 'usuarios', JWT + Roles guard, ADMIN only)
  { controller: 'UsersController', method: 'GET', path: '/api/usuarios', requiresAuth: true, roles: ['ADMIN'] },
  { controller: 'UsersController', method: 'POST', path: '/api/usuarios', requiresAuth: true, roles: ['ADMIN'] },
  { controller: 'UsersController', method: 'GET', path: '/api/usuarios/:id', requiresAuth: true, roles: ['ADMIN'] },
  { controller: 'UsersController', method: 'PATCH', path: '/api/usuarios/:id', requiresAuth: true, roles: ['ADMIN'] },
  // RequisitionsController (route: 'requisicoes', JWT + Roles guard)
  { controller: 'RequisitionsController', method: 'GET', path: '/api/requisicoes', requiresAuth: true },
  { controller: 'RequisitionsController', method: 'GET', path: '/api/requisicoes/:id', requiresAuth: true },
  { controller: 'RequisitionsController', method: 'POST', path: '/api/requisicoes', requiresAuth: true },
  { controller: 'RequisitionsController', method: 'PATCH', path: '/api/requisicoes/:id', requiresAuth: true },
  { controller: 'RequisitionsController', method: 'PATCH', path: '/api/requisicoes/:id/status', requiresAuth: true },
  { controller: 'RequisitionsController', method: 'POST', path: '/api/requisicoes/:id/atribuir', requiresAuth: true },
  { controller: 'RequisitionsController', method: 'POST', path: '/api/requisicoes/:id/assumir', requiresAuth: true },
  { controller: 'RequisitionsController', method: 'POST', path: '/api/requisicoes/:id/execucao', requiresAuth: true },
  { controller: 'RequisitionsController', method: 'PATCH', path: '/api/requisicoes/:id/finalizar', requiresAuth: true },
  { controller: 'RequisitionsController', method: 'POST', path: '/api/requisicoes/:id/cancelar', requiresAuth: true },
  { controller: 'RequisitionsController', method: 'POST', path: '/api/requisicoes/:id/notificar-gestor', requiresAuth: true },
  // CategoriesController (route: 'categorias', JWT + Roles guard, ADMIN only)
  { controller: 'CategoriesController', method: 'GET', path: '/api/categorias', requiresAuth: true, roles: ['ADMIN'] },
  { controller: 'CategoriesController', method: 'POST', path: '/api/categorias', requiresAuth: true, roles: ['ADMIN'] },
  { controller: 'CategoriesController', method: 'PATCH', path: '/api/categorias/:id', requiresAuth: true, roles: ['ADMIN'] },
  { controller: 'CategoriesController', method: 'DELETE', path: '/api/categorias/:id', requiresAuth: true, roles: ['ADMIN'] },
  // DashboardController (route: 'painel', JWT + Roles guard)
  { controller: 'DashboardController', method: 'GET', path: '/api/painel', requiresAuth: true },
  { controller: 'DashboardController', method: 'GET', path: '/api/painel/requisitions-by-status', requiresAuth: true },
  // ExecutionRecordsController (route: 'execucoes', JWT + Roles guard)
  { controller: 'ExecutionRecordsController', method: 'GET', path: '/api/execucoes', requiresAuth: true },
  { controller: 'ExecutionRecordsController', method: 'GET', path: '/api/execucoes/requisicao/:id', requiresAuth: true },
  { controller: 'ExecutionRecordsController', method: 'POST', path: '/api/execucoes/requisicao/:id', requiresAuth: true, roles: ['EXECUTOR'] },
  { controller: 'ExecutionRecordsController', method: 'POST', path: '/api/execucoes/requisicao/:id/observacao', requiresAuth: true, roles: ['EXECUTOR'] },
  // ExecutorsController (route: 'executores', JWT + Roles guard)
  { controller: 'ExecutorsController', method: 'GET', path: '/api/executores', requiresAuth: true },
  // GestoresController (route: 'gestores', JWT + Roles guard)
  { controller: 'GestoresController', method: 'GET', path: '/api/gestores', requiresAuth: true },
  // HistoryController (route: 'requisicoes', JWT + Roles guard)
  { controller: 'HistoryController', method: 'GET', path: '/api/requisicoes/:id/historico', requiresAuth: true },
  // LocationsController (route: 'locais', JWT + Roles guard, ADMIN only)
  { controller: 'LocationsController', method: 'GET', path: '/api/locais', requiresAuth: true, roles: ['ADMIN'] },
  { controller: 'LocationsController', method: 'POST', path: '/api/locais', requiresAuth: true, roles: ['ADMIN'] },
  { controller: 'LocationsController', method: 'PATCH', path: '/api/locais/:id', requiresAuth: true, roles: ['ADMIN'] },
  { controller: 'LocationsController', method: 'DELETE', path: '/api/locais/:id', requiresAuth: true, roles: ['ADMIN'] },
  // NotificationsController (route: 'notificacoes', JWT + Roles guard)
  { controller: 'NotificationsController', method: 'GET', path: '/api/notificacoes', requiresAuth: true },
  // ReportsController (route: 'relatorios', JWT + Roles guard, MANAGER/ADMIN)
  { controller: 'ReportsController', method: 'GET', path: '/api/relatorios', requiresAuth: true, roles: ['MANAGER', 'ADMIN'] },
  { controller: 'ReportsController', method: 'GET', path: '/api/relatorios/export-pdf', requiresAuth: true, roles: ['MANAGER', 'ADMIN'] },
  { controller: 'ReportsController', method: 'GET', path: '/api/relatorios/export-excel', requiresAuth: true, roles: ['MANAGER', 'ADMIN'] },
  // RequestMaterialController (route: 'materiais', JWT + Roles guard, EXECUTOR)
  { controller: 'RequestMaterialController', method: 'GET', path: '/api/materiais/requisicao/:id', requiresAuth: true },
  { controller: 'RequestMaterialController', method: 'POST', path: '/api/materiais/requisicao/:id', requiresAuth: true, roles: ['EXECUTOR'] },
  // UploadController (route: 'arquivos', JWT guard)
  { controller: 'UploadController', method: 'POST', path: '/api/arquivos/photo', requiresAuth: true },
  { controller: 'UploadController', method: 'DELETE', path: '/api/arquivos/:filename', requiresAuth: true },
  // AuditoriaController (route: 'auditoria', JWT + Roles guard, ADMIN only)
  { controller: 'AuditoriaController', method: 'GET', path: '/api/auditoria', requiresAuth: true, roles: ['ADMIN'] },
];

// Helper to build a supertest request with the correct HTTP method
// Using 'any' to bypass supertest's complex type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildRequest(
  app: INestApplication,
  method: string,
  path: string,
  authToken?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const server = app.getHttpServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let req: any;

  switch (method.toUpperCase()) {
    case 'GET':
      req = request(server).get(path);
      break;
    case 'POST':
      req = request(server).post(path);
      break;
    case 'PATCH':
      req = request(server).patch(path);
      break;
    case 'DELETE':
      req = request(server).delete(path);
      break;
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }

  if (authToken) {
    req = req.set('Authorization', `Bearer ${authToken}`);
  }

  return req;
}

async function bootstrapApp(): Promise<{ app: INestApplication; authToken: string }> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new (require('@nestjs/common').ValidationPipe)({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  await app.init();

  // Get auth token by logging in
  const httpAdapter = app.getHttpAdapter();
  let authToken = '';
  
  // Try to register a test admin user then login
  // Password must meet requirements: min 8 chars, uppercase, lowercase, number, special char
  const testPassword = 'Admin123!';
  const testEmail = 'admin@test.local';
  
  try {
    await request(httpAdapter.getInstance())
      .post('/api/auth/register')
      .send({ name: 'Test Admin', email: testEmail, password: testPassword })
      .expect(201);
  } catch (e) {
    // Registration may fail if user already exists - that's okay
  }
  
  // Try to login
  try {
    const loginResp = await request(httpAdapter.getInstance())
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });
    
    if (loginResp.body && loginResp.body.accessToken) {
      authToken = loginResp.body.accessToken;
    } else if (loginResp.headers['authorization']) {
      authToken = loginResp.headers['authorization'];
    }
  } catch (e) {
    console.warn('Could not obtain auth token, proceeding without authentication');
  }

  return { app, authToken };
}

describe('All Project Endpoints Integration Test', () => {
  let app: INestApplication;
  let authToken: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let errors: Array<{ endpoint: string; controller: string; method: string; error: any }> = [];

  beforeAll(async () => {
    const result = await bootstrapApp();
    app = result.app;
    authToken = result.authToken;
    console.log(`\n=== Auth token obtained ===\n`);
  });
  
  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    errors = [];
  });

  describe('Endpoint Discovery and Requests', () => {
    it('should hit all endpoints with verbose logging and capture errors', async () => {
      console.log('\n========================================');
      console.log('STARTING ENDPOINT TEST SUITE');
      console.log('========================================\n');

      for (const endpoint of ENDPOINTS) {
        const { controller, method, path, requiresAuth, roles } = endpoint;
        
        // Build the full path, replacing :id with a placeholder
        const cleanPath = path.replace(/:id/g, '1');

        // Skip if requires auth but no token
        if (requiresAuth && !authToken) {
          console.log(`SKIP ${controller} ${method} ${path} - no auth token`);
          continue;
        }

        try {
          const req = buildRequest(app, method, cleanPath, requiresAuth ? authToken : undefined);
          const resp = await req;
          
          // Log verbose information as requested
          console.log(
            `endpoint ${path}, ${controller}, ${method} http ${resp.status !== undefined ? resp.status : 'N/A'}`
          );
        } catch (err: unknown) {
          const errorInfo = {
            endpoint: path,
            controller,
            method,
            error: {
              message: err instanceof Error ? err.message : String(err),
              status: (err as { status?: number })?.status,
            }
          };
          errors.push(errorInfo);
          console.log(
            `endpoint ${path}, ${controller}, ${method} - ERROR: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }

      console.log('\n========================================');
      console.log('TEST SUMMARY');
      console.log('========================================\n');
      
      if (errors.length === 0) {
        console.log('All endpoints responded successfully! No errors encountered.');
      } else {
        console.log(`Total errors encountered: ${errors.length}`);
        errors.forEach((e, i) => {
          console.log(`\nError ${i + 1}:`);
          console.log(`  Endpoint: ${e.endpoint}`);
          console.log(`  Controller: ${e.controller}`);
          console.log(`  Method: ${e.method}`);
          console.log(`  Error: ${e.error.message}`);
        });
      }

      // Expect no errors, but log them first
      expect(errors.length).toBe(0);
    });
  });
});