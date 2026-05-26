import { parseDbUrl } from './prisma.service';

describe('parseDbUrl', () => {
  it('parsea una URL MySQL estándar', () => {
    const result = parseDbUrl('mysql://user:password@localhost:3306/mydb');
    expect(result).toEqual({
      host: 'localhost',
      port: 3306,
      user: 'user',
      password: 'password',
      database: 'mydb',
    });
  });

  it('usa puerto 3306 por defecto si no se especifica', () => {
    const result = parseDbUrl('mysql://user:password@localhost/mydb');
    expect(result.port).toBe(3306);
  });

  it('decodifica caracteres especiales en usuario y contraseña', () => {
    const result = parseDbUrl('mysql://us%40er:p%40ss%21word@localhost:3306/mydb');
    expect(result.user).toBe('us@er');
    expect(result.password).toBe('p@ss!word');
  });

  it('parsea un host remoto con IP', () => {
    const result = parseDbUrl('mysql://admin:secret@192.168.1.10:3307/prod_db');
    expect(result).toEqual({
      host: '192.168.1.10',
      port: 3307,
      user: 'admin',
      password: 'secret',
      database: 'prod_db',
    });
  });
});
