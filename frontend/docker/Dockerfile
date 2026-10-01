
# Passo de build - compila o código TypeScript para JavaScript
FROM node:22-alpine AS builder

# Definindo o diretório de trabalho dentro do container
WORKDIR /app

# Copiando os arquivos de configuração do npm para o diretório de trabalho e instalando as dependências do projeto
COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig*.json ./
COPY src ./src

RUN npm run build


FROM nginx:alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
