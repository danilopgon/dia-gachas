# Etapa de build
FROM node:20-bullseye AS builder

# Directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY . .

# Instalar dependencias
RUN npm install

# Compilar el proyecto NestJS
RUN npm run build

# Etapa final (runner)
FROM node:20-bullseye AS runner

# Directorio de trabajo en la imagen final
WORKDIR /app

# Copiar solo lo necesario desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Comando por defecto
CMD ["node", "dist/src/main"]
