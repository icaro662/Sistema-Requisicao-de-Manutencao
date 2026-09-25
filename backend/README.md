# API do Sistema de Manutenção


Boilerplate NestJS para o sistema de requisições de manutenção descrito nos documentos de arquitetura do backend.

## Configuração

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run build
npm.cmd run start:dev
```

A API é servida em `http://localhost:3000/api`. O endpoint de saúde é `GET /api/health`.

O scaffold atual fornece os limites dos módulos, as bases de DTOs/entidades, os contratos de rotas, a validação global, a estrutura da estratégia JWT e a configuração do MySQL. A persistência de negócio, a emissão de tokens, as notificações, as exportações e os uploads foram deixados intencionalmente como pontos de implementação para a próxima etapa.
