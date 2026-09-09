# 40 · Fases completas (0 → 23)

> Fuente: BRS §67. Índice general en [`../README.md`](../README.md).
>
> **Regla dura para agentes:** identifica la fase actual antes de tocar nada y
> **no avances de fase por iniciativa propia**
> (ver [`../agents/50-instrucciones-generales.md`](../agents/50-instrucciones-generales.md)).

---

## 67. Fases completas

### Fase 0 — Baseline

Capturar:

```text
frontend build
frontend tests
Nest build
Nest tests
API responses
production behavior
```

Crear baseline/tag.

---

### Fase 1 — Angular 20

Upgrade framework.

Cambios mínimos.

→ [`../frontend/10-angular-upgrade.md`](../frontend/10-angular-upgrade.md) §20

---

### Fase 2 — Angular 21

Upgrade framework.

Mantener todavía UI funcional.

→ [`../frontend/10-angular-upgrade.md`](../frontend/10-angular-upgrade.md) §21

---

### Fase 3 — PrimeNG removal: primitives

Sustituir:

```text
buttons
icons
float label
popover
toast
theme
```

No autocomplete todavía.

→ [`../frontend/12-primeng-sustituciones.md`](../frontend/12-primeng-sustituciones.md), [`../frontend/13-theming.md`](../frontend/13-theming.md)

---

### Fase 4 — Autocomplete

Construir:

```text
Angular ARIA Combobox
Angular ARIA Listbox
CDK Overlay
httpResource
```

Probar teclado y accesibilidad.

→ [`../frontend/14-autocomplete-accesible.md`](../frontend/14-autocomplete-accesible.md)

---

### Fase 5 — PrimeNG purge

Eliminar:

```text
primeng
@primeng/themes
primeicons
tailwindcss-primeui
config files
CSS tokens
test dependencies
```

Definition:

```text
PrimeNG = 0
```

→ [`../frontend/11-primeng-decision.md`](../frontend/11-primeng-decision.md) §19

---

### Fase 6 — Angular 22

Actualizar:

```text
Angular
CLI
TypeScript
Node
angular-eslint
CDK / Angular ARIA
```

Aplicar migrations.

→ [`../frontend/10-angular-upgrade.md`](../frontend/10-angular-upgrade.md) §24, §25

---

### Fase 7 — Zoneless / OnPush

Eliminar Zone.js.

Auditar change detection.

→ [`../frontend/15-reactividad-signals.md`](../frontend/15-reactividad-signals.md) §26, §27

---

### Fase 8 — Vitest

Migrar Jest.

→ [`../frontend/17-testing-frontend.md`](../frontend/17-testing-frontend.md) §33

---

### Fase 9 — Angular modern API refactor

Refactor:

```text
Weather → httpResource
Cities → httpResource
manual derived effects → computed/linkedSignal
Signal Forms donde aporte
animations legacy → CSS/native
```

→ [`../frontend/15-reactividad-signals.md`](../frontend/15-reactividad-signals.md)

---

### Fase 10 — .NET skeleton

Crear:

```text
Api
Application
Domain
Infrastructure
tests
Dockerfile
```

→ [`../backend/20-arquitectura.md`](../backend/20-arquitectura.md)

---

### Fase 11 — Cities

EF Core + SearchCitiesQuery.

→ [`../backend/21-persistencia.md`](../backend/21-persistencia.md), [`../backend/22-cities.md`](../backend/22-cities.md)

---

### Fase 12 — Municipality import

Command idempotente.

→ [`../backend/22-cities.md`](../backend/22-cities.md) §42

---

### Fase 13 — AEMET infrastructure

Provider + mapper.

→ [`../backend/23-aemet.md`](../backend/23-aemet.md)

---

### Fase 14 — Gachas domain

Scoring + tests.

→ [`../backend/24-dominio-gachas.md`](../backend/24-dominio-gachas.md)

---

### Fase 15 — Weather query

Endpoint completo.

→ [`../backend/25-contratos-api.md`](../backend/25-contratos-api.md)

---

### Fase 16 — Resilience

Añadir:

```text
caching
rate limiting
ProblemDetails
logging
```

→ [`../backend/26-resiliencia.md`](../backend/26-resiliencia.md)

---

### Fase 17 — Nuevo Weather contract

Añadir:

```text
score
reasons
bestForGachas
```

→ [`../backend/25-contratos-api.md`](../backend/25-contratos-api.md) §49

---

### Fase 18 — Angular/.NET integration

Frontend apunta al backend .NET.

---

### Fase 19 — Nueva UI Weather

Renderizar explicación.

→ [`../frontend/16-ui-veredicto-y-share.md`](../frontend/16-ui-veredicto-y-share.md)

---

### Fase 20 — Contract parity

Nest vs .NET.

→ [`../backend/25-contratos-api.md`](../backend/25-contratos-api.md) §63

---

### Fase 21 — Staging

Desplegar .NET en hostname temporal.

→ [`../ops/30-docker-coolify.md`](../ops/30-docker-coolify.md)

---

### Fase 22 — Cutover

```text
api.domain
→
ASP.NET
```

---

### Fase 23 — Nest retirement

Eliminar deployment antiguo.

---

## Señales de verificación

Cada fase tiene una señal **objetiva y derivable del repositorio**. No se marca
una fase como hecha porque lo diga nadie: se marca porque el repo lo demuestra.

```bash
./scripts/migration-status.sh
```

| Fase | Señal de que está hecha |
|---|---|
| 00 | Existe un tag `baseline/*` |
| 01 | `@angular/core` ≥ 20 |
| 02 | `@angular/core` ≥ 21 |
| 03 | Cero `p-button`, `p-floatlabel`, `p-popover`, `p-toast` en `frontend/src` |
| 04 | Cero `p-autocomplete` y existe `CityAutocompleteComponent` |
| 05 | Cero coincidencias de `prime` en `frontend/src` y en `frontend/package.json` |
| 06 | `@angular/core` ≥ 22 |
| 07 | Sin `zone.js` en `package.json` ni `provideZoneChangeDetection` en el código |
| 08 | `vitest` en devDependencies y `jest.config.js` eliminado |
| 09 | `httpResource` presente en `frontend/src` |
| 10 | Existe `backend-dotnet/src/DiaGachas.Api` |
| 11 | Existe `SearchCitiesQuery` |
| 12 | Existe `ImportMunicipalityCatalogCommand` |
| 13 | Existen `AemetForecastProvider` y `AemetForecastMapper` |
| 14 | Existe `GachasScoringPolicy` |
| 15 | Existe `GetWeatherForecastQuery` |
| 16 | `HybridCache` o `AddRateLimiter` configurados |
| 17 | `BestForGachas` presente en el backend |
| 18 | ✋ No derivable: vive en la configuración del deploy |
| 19 | `gachasReasons` renderizado en `frontend/src` |
| 20 | Existen contract tests |
| 21 | ✋ No derivable: vive en Coolify |
| 22 | ✋ No derivable: vive en el DNS |
| 23 | `backend/src/app.module.ts` ya no existe |

Las tres fases ✋ se declaran a mano en [`42-estado.md`](./42-estado.md).

---

## Documentos relacionados

- Dónde estamos ahora mismo: [`42-estado.md`](./42-estado.md)
- Bitácora de desviaciones: [`43-bitacora.md`](./43-bitacora.md)
- Estrategia de PRs (una fase ≠ un PR necesariamente): [`41-estrategia-prs.md`](./41-estrategia-prs.md)
- Definition of Done: [`../agents/53-definition-of-done.md`](../agents/53-definition-of-done.md)
