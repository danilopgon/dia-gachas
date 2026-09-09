# 30 · Despliegue: Coolify y Docker

> Fuente: BRS §64, §65. Índice general en [`../README.md`](../README.md).

---

## 64. Coolify

Durante la migración:

```text
Coolify
│
├── frontend-angular
├── api-nest
├── api-dotnet
└── mysql
```

Nuevo backend:

```text
/backend-dotnet
Dockerfile
port 8080
/health
```

---

## 65. Docker

Multi-stage:

```text
.NET SDK
   ↓
publish
   ↓
ASP.NET runtime
```

El container debe ser portable.

No depender de APIs específicas de Coolify.

---

## Documentos relacionados

- Healthcheck: [`../backend/26-resiliencia.md`](../backend/26-resiliencia.md) §59
- Fases 21, 22 y 23 (staging, cutover, retirada de Nest): [`../plan/40-fases.md`](../plan/40-fases.md)
