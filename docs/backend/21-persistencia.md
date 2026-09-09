# 21 · Persistencia y EF Core

> Fuente: BRS §38, §39. Índice general en [`../README.md`](../README.md).

---

## §38 · Persistencia

Modelo:

```text
Province
├── Id
└── Name

City
├── Id
├── Name
└── ProvinceId
```

IDs siguen siendo strings.

Motivo:

```text
preservar ceros iniciales de códigos AEMET
```

---

## §39 · EF Core

EF Core será dueño completo del nuevo schema.

No:

```text
GenericRepository
UnitOfWork wrapper
```

Utilizar `DbContext` directamente donde corresponda.

Base temporal:

```text
dia_gachas_dotnet
```

separada del schema Prisma.

---

## Documentos relacionados

- Import idempotente del catálogo: [`22-cities.md`](./22-cities.md) §42
- Testing de EF mappings e integración con Testcontainers: [`27-testing-backend.md`](./27-testing-backend.md)
