# Imagem pré-construída do Node.js baseada no Debian Bookworm para buildar a aplicação (Compilar o código TypeScript para JavaScript)
FROM node:22-bookworm AS builder 

# Definindo o diretório de trabalho dentro do container
WORKDIR /app

# Copiando os arquivos de configuração do npm para o diretório de trabalho
COPY package*.json ./
RUN npm ci

# Copiando todos os arquivos do projeto local (primeiro ".") para o diretório de trabalho do container (segundo ".")
COPY . .

# Rodando o comando de build do npm para compilar o código TypeScript para JavaScript
RUN npm run build

# Imagem pré-construída do Node.js baseada no Debian Bookworm para rodar a aplicação em produção
FROM node:22-bookworm-slim AS production

# Definindo o diretório de trabalho dentro do container
WORKDIR /app

# Definindo a variável de ambiente NODE_ENV como "production" para otimizar a performance da aplicação e evitar a instalação de dependências de desenvolvimento
ENV NODE_ENV=production

# Copiando os arquivos de configuração do npm para o diretório de trabalho
COPY package*.json ./

# Instalando apenas as dependências de produção, omitindo as dependências de desenvolvimento
RUN npm ci --omit=dev

# Copiando os arquivos compilados do estágio de build (dist/) para o diretório de trabalho do container (Primeiro "." se refere ao diretório de trabalho do container, e o segundo "." se refere ao diretório de trabalho dos passos anteriores)
COPY --from=builder /app/dist ./dist

# Rodando o comando para iniciar a aplicação Node.js, executando o arquivo principal (main.js) dentro do diretório dist/
CMD ["node", "dist/main.js"]