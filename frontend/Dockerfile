# Etapa de build
FROM node:20-alpine AS builder
WORKDIR /app

COPY . .

RUN npm install
RUN npm run build:ssr

# Etapa de producción
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "dist/dia-gachas/server/server.mjs"]
