import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

export function parseDbUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
  };
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const { host, port, user, password, database } = parseDbUrl(
      process.env.DATABASE_URL!,
    );
    const adapter = new PrismaMariaDb({
      host,
      port,
      user,
      password,
      database,
      allowPublicKeyRetrieval: true,
      connectTimeout: 5_000, // v6 default was 5s; driver default is 1s (too low for container networking)
      idleTimeout: 300,      // v6 default was 300s; driver default is 1800s
      connectionLimit: 10,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
