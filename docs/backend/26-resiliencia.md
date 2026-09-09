# 26 · Resiliencia: caching, rate limiting y healthcheck

> Fuente: BRS §57, §58, §59. Índice general en [`../README.md`](../README.md).

---

## §57 · Caching

Backend:

```text
HybridCache
```

Clave:

```text
weather:{municipalityCode}
```

TTL inicial:

```text
1 hora
```

No duplicar lógica de cache meteorológico compleja en frontend.

---

## §58 · Rate limiting

Aplicar policies diferenciadas.

```text
Cities
→ suficientemente permisivo para autocomplete

Weather
→ más restrictivo
```

---

## §59 · Healthcheck

```http
GET /health
```

No consultar AEMET.

Un proveedor externo caído no significa que el container esté muerto.

---

## Documentos relacionados

- Errores expuestos al cliente (`429`, `502`…): [`25-contratos-api.md`](./25-contratos-api.md) §56
- `/health` en el despliegue: [`../ops/30-docker-coolify.md`](../ops/30-docker-coolify.md)
- Fase 16 — Resilience: [`../plan/40-fases.md`](../plan/40-fases.md)
