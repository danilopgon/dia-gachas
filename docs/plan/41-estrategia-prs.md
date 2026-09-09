# 41 · Estrategia de PRs

> Fuente: BRS §68. Índice general en [`../README.md`](../README.md).

---

## §68 · Estrategia de PRs

Ejemplo:

```text
PR 01 Angular 20
PR 02 Angular 21

PR 03 native buttons/icons/labels
PR 04 popover/toast
PR 05 theme token migration
PR 06 accessible CityAutocomplete
PR 07 remove PrimeNG completely

PR 08 Angular 22
PR 09 Zoneless + OnPush
PR 10 Jest → Vitest
PR 11 httpResource / Signals cleanup

PR 12 .NET skeleton
PR 13 Cities
PR 14 municipality import
PR 15 AEMET provider
PR 16 Gachas domain
PR 17 Weather query
PR 18 cache/resilience
PR 19 new Weather contract

PR 20 Angular consumes .NET
PR 21 Weather explanations UI
PR 22 parity/deploy
PR 23 cutover/cleanup
```

No es necesario convertir esta numeración en dogma.

Cada PR debe tener un propósito claro.

---

## Convención de trabajo en este repositorio

- Rama base de la migración: **`dev`** (creada desde `main`).
- Cada PR sale de `dev` y vuelve a `dev`.
- `main` solo recibe merges de `dev` cuando el estado es desplegable.
- Un PR = una fase o menos. Nunca varias fases mezcladas.

---

## Documentos relacionados

- Fases: [`40-fases.md`](./40-fases.md)
- Instrucciones para agentes: [`../agents/50-instrucciones-generales.md`](../agents/50-instrucciones-generales.md)
