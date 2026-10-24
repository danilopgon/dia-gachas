# Imagen para Railway (independiente del build de Coolify)

# Etapa de build
FROM node:22.23.4-bookworm AS builder

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias desde el lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copiar el resto del código
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Compilar el proyecto NestJS
RUN npm run build

# Etapa final (runner)
FROM node:22.23.4-bookworm AS runner

ENV NODE_ENV=production

# Directorio de trabajo en la imagen final
WORKDIR /app

# Copiar solo lo necesario desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Comando por defecto
CMD ["node", "dist/main"]
