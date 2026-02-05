# --- Stage 1: Builder ---
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN npm install

COPY src ./src

# Генерим клиент (он создаст папку /app/generated)
RUN npx prisma generate

RUN npm run build

# --- Stage 2: Runtime ---
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./ 
COPY --from=builder /app/generated ./generated 

EXPOSE 7777

# Запуск с проверкой пути до main.js
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && (node dist/src/main.js || node dist/main.js)"]