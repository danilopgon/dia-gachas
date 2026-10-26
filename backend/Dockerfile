# Imagen de la API. La usan Coolify (rollback, hasta la Entrega 8) y Railway.
# Se construye desde la raíz del workspace: docker build -f backend/Dockerfile .

# Etapa de build
FROM node:22.23.4-bookworm AS builder

RUN corepack enable

# Directorio de trabajo
WORKDIR /app

# Instalar solo el backend y sus dependencias desde el lockfile del workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/
RUN pnpm install --frozen-lockfile --filter dia-gachas-api...

# Copiar el código del backend
COPY backend/ backend/

# Compilar el proyecto NestJS
RUN pnpm --filter dia-gachas-api build

# Etapa final (runner)
FROM node:22.23.4-bookworm AS runner

ENV NODE_ENV=production

# Se conserva la estructura del workspace para que resuelvan los enlaces de pnpm
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json

WORKDIR /app/backend
USER node

# Comando por defecto
CMD ["node", "dist/main"]
