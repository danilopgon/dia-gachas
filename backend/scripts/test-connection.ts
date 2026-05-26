import 'dotenv/config';
import { createConnection } from 'mariadb';
import { parseDbUrl, PrismaService } from '../src/shared/prisma.service';

async function main() {
  const raw = process.env.DATABASE_URL;
  if (!raw) { console.error('❌ DATABASE_URL no definida'); process.exit(1); }

  // 1. Verificar parseDbUrl
  console.log('\n=== 1. parseDbUrl ===');
  let parsed: ReturnType<typeof parseDbUrl>;
  try {
    parsed = parseDbUrl(raw);
    console.log('  host    :', parsed.host);
    console.log('  port    :', parsed.port);
    console.log('  user    :', parsed.user);
    console.log('  password:', '*'.repeat(parsed.password.length), `(${parsed.password.length} chars)`);
    console.log('  database:', parsed.database);
  } catch (err: any) {
    console.error('❌ parseDbUrl falló:', err.message);
    process.exit(1);
  }

  // 2. Conexión directa (sin pool) para obtener el error real
  const opts = {
    host: parsed.host,
    port: parsed.port,
    user: parsed.user,
    password: parsed.password,
    database: parsed.database,
    connectTimeout: 10_000,
    ssl: false as const,
  };

  async function testDirectConnection(label: string, extraOpts = {}) {
    console.log(`\n=== ${label} ===`);
    try {
      const start = Date.now();
      const conn = await createConnection({ ...opts, ...extraOpts });
      console.log(`  ✅ Conexión OK en ${Date.now() - start}ms`);
      const rows = await conn.query('SELECT VERSION() AS version, USER() AS user');
      console.log('  ✅ MySQL version:', rows[0].version);
      console.log('  ✅ Connected as:', rows[0].user);
      await conn.end();
      return true;
    } catch (err: any) {
      console.log('  ❌ Error:', err.message);
      console.log('  Código:', err.code, '| Errno:', err.errno, '| SQLState:', err.sqlState);

      if (err.code === 'ECONNREFUSED') {
        console.log('\n  → El servidor rechazó la conexión TCP.');
        console.log('  → Verifica que el puerto', parsed.port, 'esté abierto en el firewall de Coolify.');
      } else if (err.code === 'ETIMEDOUT' || err.errno === 45028) {
        console.log('\n  → Timeout TCP: el servidor no responde en el tiempo límite.');
        console.log('  → Desde esta máquina no hay acceso al servidor. Prueba desde dentro de Coolify.');
      } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('\n  → Credenciales incorrectas o usuario sin permisos.');
      } else if (err.code === 'ER_CANNOT_RETRIEVE_RSA_KEY' || err.message?.includes('sha2') || err.message?.includes('caching')) {
        console.log('\n  → MySQL 8 usa caching_sha2_password y el cliente no tiene la clave RSA pública.');
        console.log('  → Opciones: habilitar allowPublicKeyRetrieval en el cliente o cambiar el usuario a mysql_native_password:');
        console.log('     ALTER USER \''+parsed.user+'\'@\'%\' IDENTIFIED WITH mysql_native_password BY \'<password>\';');
      }

      return false;
    }
  }

  try {
    const connected = await testDirectConnection('2. Conexión directa (sin pool)');
    if (!connected) {
      await testDirectConnection('2b. Conexión directa con allowPublicKeyRetrieval', {
        allowPublicKeyRetrieval: true,
      });
    }
  } catch (err: any) {
    console.error('  ❌ Error inesperado:', err.message);
  }

  // 3. Test TCP puro (sin mariadb)
  console.log('\n=== 3. Alcanzabilidad TCP ===');
  await new Promise<void>((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    const timeout = 5000;
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      console.log(`  ✅ Puerto ${parsed.port} alcanzable en ${parsed.host}`);
      socket.destroy();
      resolve();
    });
    socket.on('timeout', () => {
      console.error(`  ❌ Timeout: ${parsed.host}:${parsed.port} no responde en ${timeout}ms`);
      console.log('  → El puerto NO es accesible desde esta máquina.');
      console.log('  → En producción (dentro de Coolify) puede ser diferente.');
      socket.destroy();
      resolve();
    });
    socket.on('error', (err: any) => {
      console.error(`  ❌ TCP error: ${err.message}`);
      socket.destroy();
      resolve();
    });
    socket.connect(parsed.port, parsed.host);
  });

  console.log('\n=== 4. PrismaService ===');
  const prisma = new PrismaService();
  try {
    const start = Date.now();
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 AS ok`;
    console.log(`  ✅ Prisma conectó en ${Date.now() - start}ms`);
    console.log('  ✅ Query OK:', result);
  } catch (err: any) {
    console.log('  ❌ Prisma falló:', err.message);
    console.log('  Código:', err.code);
  } finally {
    await prisma.$disconnect();
  }
}

main();
