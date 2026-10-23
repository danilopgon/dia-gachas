import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    // `prisma generate` no necesita conexión; los comandos que sí la usan fallan si falta.
    url: process.env.DATABASE_URL,
  },
});
