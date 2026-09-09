# CLAUDE.md

> **Lee [`AGENTS.md`](./AGENTS.md) antes de tocar nada.**

Este repositorio usa `AGENTS.md` como punto de entrada único para agentes.
Ahí están el stack actual, el objetivo de la migración, las reglas que no se
negocian y el router hacia la documentación troceada de [`docs/`](./docs/README.md).

Este fichero no duplica nada de eso a propósito: una sola fuente de verdad.

## Lo mínimo antes de empezar

1. [`AGENTS.md`](./AGENTS.md) — contexto y reglas.
2. [`docs/plan/40-fases.md`](./docs/plan/40-fases.md) — en qué fase estamos.
3. Solo los documentos que esa fase referencia. **No cargues `docs/` entero.**

## Recordatorio rápido

- No se reintroduce PrimeNG ni PrimeUI.
- No se avanza de fase por iniciativa propia.
- Se preserva el comportamiento salvo cambio documentado.
- `lint` + `test` + `build` verdes antes de cerrar, y revisa tu propio diff.
