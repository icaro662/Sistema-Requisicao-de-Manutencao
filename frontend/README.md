# Frontend Maintaina

Console operacional em React + Vite + TypeScript para a API do sistema de manutenção.

## Executar localmente

From this directory:

```powershell
npm.cmd install
npm.cmd run dev
```

Abra `http://localhost:5173`. O servidor de desenvolvimento do Vite encaminha `/api` para `http://localhost:3000`, em conformidade com o backend NestJS.

Para usar outro host da API, copie `.env.example` para `.env` e defina `VITE_API_URL`, por exemplo `VITE_API_URL=http://localhost:3000/api`.

## Integração atual com a API

O cliente está conectado aos endpoints do backend atualmente implementados:

- Login, cadastro e logout
- Resumo do painel
- Lista, detalhes e atualizações de status das requisições
- Consultas de usuários, locais, categorias e executores

O scaffold do backend ainda não emite JWTs nem implementa a criação de requisições e dados de referência. A interface mantém essas ações visíveis, porém desabilitadas, até que seus contratos de API estejam disponíveis. Quando o backend retornar um `accessToken`, o cliente da API o enviará automaticamente como token bearer a partir do armazenamento local.

## Compilação

```powershell
npm.cmd run build
```
