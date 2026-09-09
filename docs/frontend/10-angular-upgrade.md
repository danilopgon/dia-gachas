# 10 · Upgrade Angular 19 → 22

> Fuente: BRS §20, §21, §24, §25. Índice general en [`../README.md`](../README.md).
>
> La secuencia completa (incluyendo dónde encaja la retirada de PrimeNG) está en
> [`11-primeng-decision.md`](./11-primeng-decision.md) §18.

---

## 20. Angular 19 → 20

Ejecutar migration oficial.

```bash
ng update @angular/core@20 @angular/cli@20
```

Resolver exclusivamente problemas del upgrade.

No refactorizar recursos ni UI simultáneamente.

Validar:

```text
build
tests
SSR
PWA
UI
```

---

## 21. Angular 20 → 21

Después:

```bash
ng update @angular/core@21 @angular/cli@21
```

Mismo procedimiento.

Estabilizar completamente antes de abordar PrimeNG.

---

## 24. Angular 21 → 22

Una vez PrimeNG ya no exista:

```bash
ng update @angular/core@22 @angular/cli@22
```

El último major queda desacoplado de cualquier component library externa.

Esto reduce muchísimo el coste futuro de upgrades Angular.

---

## 25. Objetivo Angular 22

No basta con:

```text
package.json → 22
```

Queremos código idiomático moderno.

Evaluar deliberadamente:

```text
httpResource
resource
computed
linkedSignal
Signal Forms
Angular ARIA
Zoneless
OnPush
modern signal APIs
Vitest
CSS animations
```

No usar todas obligatoriamente.

---

## Documentos relacionados

- Zoneless / OnPush / signals: [`15-reactividad-signals.md`](./15-reactividad-signals.md)
- Testing y migración a Vitest: [`17-testing-frontend.md`](./17-testing-frontend.md)
- Fases 1, 2 y 6 del plan: [`../plan/40-fases.md`](../plan/40-fases.md)
