# Imagen de la API y de la ingesta (Railway: servicio `api` con `node dist/main`, servicio cron `ingest` con `node dist/ingest`).
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

# Catálogo de municipios para la ingesta (nombres y provincias por código)
COPY frontend/public/data/municipios.json /app/data/municipios.json

WORKDIR /app/backend
USER node

# Comando por defecto
CMD ["node", "dist/main"]
