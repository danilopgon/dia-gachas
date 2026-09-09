# Documentación de la migración — Día de Gachas

Índice de la documentación del proceso de modernización
(Angular 19 → 22, retirada de PrimeNG, NestJS/Prisma → ASP.NET Core/EF Core).

> **Punto de entrada para agentes:** [`../AGENTS.md`](../AGENTS.md).
> Este fichero es el índice detallado; `AGENTS.md` es el router corto.

---

## De dónde sale todo esto

Esta documentación es el troceado del BRS original:

> **Día de Gachas — Plan integral de modernización**
> Angular 19 → Angular 22
> Retirada de PrimeNG
> NestJS/Prisma → ASP.NET Core/EF Core
> Nueva explicación del veredicto de gachas

El original íntegro se conserva congelado en
[`archivo/brs-original.md`](./archivo/brs-original.md); la fuente de verdad viva
son los documentos listados abajo.

---

## Cómo usar esta documentación

Está troceada a propósito: **carga solo el documento de la fase en la que estás**.
Ningún documento supera el tamaño de un contexto cómodo, y cada uno enlaza a sus
vecinos al final.

```text
1. ¿En qué fase estoy?      → ./scripts/migration-status.sh  (y plan/42-estado.md)
2. ¿Qué toca hacer?         → plan/40-fases.md
3. ¿Qué dice el plan?       → el documento que esa fase referencia
4. ¿Cómo debo comportarme?  → agents/50-instrucciones-generales.md
5. ¿Cuándo he terminado?    → agents/53-definition-of-done.md
```

---

## Índice

### Transversal

| Documento | Contenido |
|---|---|
| [`00-vision-y-alcance.md`](./00-vision-y-alcance.md) | Propósito, principio rector, cosas que no vamos a introducir |
| [`01-estado-actual.md`](./01-estado-actual.md) | Stack actual, huella de PrimeNG, inventario real del repo |

### Frontend

| Documento | Contenido |
|---|---|
| [`frontend/10-angular-upgrade.md`](./frontend/10-angular-upgrade.md) | 19→20, 20→21, 21→22 y qué significa "Angular 22 de verdad" |
| [`frontend/11-primeng-decision.md`](./frontend/11-primeng-decision.md) | Decisión, filosofía, secuencia de transición y punto de salida |
| [`frontend/12-primeng-sustituciones.md`](./frontend/12-primeng-sustituciones.md) | Mapa de equivalencias, botones, iconos, float label, popover, toast |
| [`frontend/13-theming.md`](./frontend/13-theming.md) | Tokens propios y eliminación del theme PrimeNG |
| [`frontend/14-autocomplete-accesible.md`](./frontend/14-autocomplete-accesible.md) | CityAutocomplete, Angular ARIA, CDK Overlay, Signal Forms |
| [`frontend/15-reactividad-signals.md`](./frontend/15-reactividad-signals.md) | Zoneless, OnPush, httpResource, effects, linkedSignal, animaciones, loading/errors |
| [`frontend/16-ui-veredicto-y-share.md`](./frontend/16-ui-veredicto-y-share.md) | Nueva UI del veredicto y feedback al compartir |
| [`frontend/17-testing-frontend.md`](./frontend/17-testing-frontend.md) | Jest → Vitest, cobertura y tests de accesibilidad |

### Backend

| Documento | Contenido |
|---|---|
| [`backend/20-arquitectura.md`](./backend/20-arquitectura.md) | Estructura de proyectos, Clean Architecture, organización funcional, CQRS |
| [`backend/21-persistencia.md`](./backend/21-persistencia.md) | Modelo Province/City, IDs string, EF Core como dueño del schema |
| [`backend/22-cities.md`](./backend/22-cities.md) | `GET /cities`, SearchCitiesQuery, import idempotente del catálogo |
| [`backend/23-aemet.md`](./backend/23-aemet.md) | Provider + mapper, aislamiento de la integración externa |
| [`backend/24-dominio-gachas.md`](./backend/24-dominio-gachas.md) | GachasVerdict, score, reasons, bestForGachas, typo launch/lunch |
| [`backend/25-contratos-api.md`](./backend/25-contratos-api.md) | Contrato Weather, ProblemDetails, contract parity Nest vs .NET |
| [`backend/26-resiliencia.md`](./backend/26-resiliencia.md) | HybridCache, rate limiting, healthcheck |
| [`backend/27-testing-backend.md`](./backend/27-testing-backend.md) | Domain, Application, Infrastructure, Integration, Architecture tests |

### Operación

| Documento | Contenido |
|---|---|
| [`ops/30-docker-coolify.md`](./ops/30-docker-coolify.md) | Topología en Coolify y Dockerfile multi-stage |
| [`ops/31-ci.md`](./ops/31-ci.md) | Pipelines frontend y backend, contract tests |

### Plan

| Documento | Contenido |
|---|---|
| [`plan/40-fases.md`](./plan/40-fases.md) | Fases 0 → 23, con enlace al documento de cada una |
| [`plan/41-estrategia-prs.md`](./plan/41-estrategia-prs.md) | Troceado en PRs y convención de ramas del repo |
| [`plan/42-estado.md`](./plan/42-estado.md) | **Dónde estamos.** Estado por fase, PRs y protocolo de apertura/cierre |
| [`plan/43-bitacora.md`](./plan/43-bitacora.md) | Decisiones y desviaciones respecto al plan |

### Reglas para agentes

| Documento | Contenido |
|---|---|
| [`agents/50-instrucciones-generales.md`](./agents/50-instrucciones-generales.md) | Cómo trabaja un agente en este repo |
| [`agents/51-criterio-dependencias.md`](./agents/51-criterio-dependencias.md) | Las 5 preguntas antes de añadir una dependencia |
| [`agents/52-criterio-modernizacion.md`](./agents/52-criterio-modernizacion.md) | Cuándo un refactor está justificado |
| [`agents/53-definition-of-done.md`](./agents/53-definition-of-done.md) | DoD frontend, backend y producto |

### Referencia

| Documento | Contenido |
|---|---|
| [`referencia/60-dependencias-objetivo.md`](./referencia/60-dependencias-objetivo.md) | Dependencias objetivo y APIs Angular a demostrar |
| [`referencia/61-narrativa-y-valor.md`](./referencia/61-narrativa-y-valor.md) | Narrativa técnica final, valor para entrevista, regla final |

### Archivo

| Documento | Contenido |
|---|---|
| [`archivo/brs-original.md`](./archivo/brs-original.md) | BRS original íntegro. **Congelado.** No es fuente de verdad; solo trazabilidad |

---

## Trazabilidad BRS → documentos

Las 80 secciones del BRS original están repartidas sin pérdida. Mapa completo:

| BRS § | Documento |
|---|---|
| §1 Propósito | `00-vision-y-alcance.md` |
| §2 Principio rector | `00-vision-y-alcance.md` |
| §3 Estado actual | `01-estado-actual.md` |
| §4 Decisión sobre PrimeNG | `frontend/11-primeng-decision.md` |
| §5 Filosofía de sustitución | `frontend/11-primeng-decision.md` |
| §6 Huella actual de PrimeNG | `01-estado-actual.md` |
| §7 Mapa de equivalencias UI | `frontend/12-primeng-sustituciones.md` |
| §8 Botones | `frontend/12-primeng-sustituciones.md` |
| §9 Iconos | `frontend/12-primeng-sustituciones.md` |
| §10 Float label | `frontend/12-primeng-sustituciones.md` |
| §11 Autocomplete de municipios | `frontend/14-autocomplete-accesible.md` |
| §12 Componente CityAutocomplete | `frontend/14-autocomplete-accesible.md` |
| §13 Signal Forms | `frontend/14-autocomplete-accesible.md` |
| §14 Popover de créditos | `frontend/12-primeng-sustituciones.md` |
| §15 Toast | `frontend/12-primeng-sustituciones.md` |
| §16 Theming | `frontend/13-theming.md` |
| §17 Tokens PrimeNG existentes | `frontend/13-theming.md` |
| §18 Estrategia de transición | `frontend/11-primeng-decision.md` |
| §19 Punto de salida de PrimeNG | `frontend/11-primeng-decision.md` |
| §20 Angular 19 → 20 | `frontend/10-angular-upgrade.md` |
| §21 Angular 20 → 21 | `frontend/10-angular-upgrade.md` |
| §22 Retirada de PrimeNG (orden) | `frontend/11-primeng-decision.md` |
| §23 Angular ARIA | `frontend/14-autocomplete-accesible.md` |
| §24 Angular 21 → 22 | `frontend/10-angular-upgrade.md` |
| §25 Objetivo Angular 22 | `frontend/10-angular-upgrade.md` |
| §26 Zoneless | `frontend/15-reactividad-signals.md` |
| §27 OnPush | `frontend/15-reactividad-signals.md` |
| §28 WeatherResource actual | `frontend/15-reactividad-signals.md` |
| §29 CitiesResource actual | `frontend/15-reactividad-signals.md` |
| §30 Effects | `frontend/15-reactividad-signals.md` |
| §31 linkedSignal | `frontend/15-reactividad-signals.md` |
| §32 Animaciones | `frontend/15-reactividad-signals.md` |
| §33 Testing frontend (runner) | `frontend/17-testing-frontend.md` |
| §34 Backend objetivo | `backend/20-arquitectura.md` |
| §35 Arquitectura | `backend/20-arquitectura.md` |
| §36 Organización funcional | `backend/20-arquitectura.md` |
| §37 CQRS | `backend/20-arquitectura.md` |
| §38 Persistencia | `backend/21-persistencia.md` |
| §39 EF Core | `backend/21-persistencia.md` |
| §40 SearchCities | `backend/22-cities.md` |
| §41 SearchCitiesQuery | `backend/22-cities.md` |
| §42 ImportMunicipalityCatalogCommand | `backend/22-cities.md` |
| §43 Weather actual | `backend/23-aemet.md` |
| §44 Arquitectura Weather | `backend/23-aemet.md` |
| §45 IAemetForecastProvider | `backend/23-aemet.md` |
| §46 AemetForecastMapper | `backend/23-aemet.md` |
| §47 Dominio de gachas | `backend/24-dominio-gachas.md` |
| §48 Nueva funcionalidad | `backend/24-dominio-gachas.md` |
| §49 Contrato Weather nuevo | `backend/25-contratos-api.md` |
| §50 Typo launch/lunch | `backend/24-dominio-gachas.md` |
| §51 Mejor día para gachas | `backend/24-dominio-gachas.md` |
| §52 Angular consume Weather nuevo | `frontend/16-ui-veredicto-y-share.md` |
| §53 UI del nuevo veredicto | `frontend/16-ui-veredicto-y-share.md` |
| §54 Loading y errors sin PrimeNG | `frontend/15-reactividad-signals.md` |
| §55 Share feedback | `frontend/16-ui-veredicto-y-share.md` |
| §56 ProblemDetails | `backend/25-contratos-api.md` |
| §57 Caching | `backend/26-resiliencia.md` |
| §58 Rate limiting | `backend/26-resiliencia.md` |
| §59 Healthcheck | `backend/26-resiliencia.md` |
| §60 Testing backend | `backend/27-testing-backend.md` |
| §61 Testing frontend (cobertura) | `frontend/17-testing-frontend.md` |
| §62 Accessibility tests | `frontend/17-testing-frontend.md` |
| §63 Contract parity | `backend/25-contratos-api.md` |
| §64 Coolify | `ops/30-docker-coolify.md` |
| §65 Docker | `ops/30-docker-coolify.md` |
| §66 CI | `ops/31-ci.md` |
| §67 Fases completas | `plan/40-fases.md` |
| §68 Estrategia de PRs | `plan/41-estrategia-prs.md` |
| §69 Dependencias objetivo frontend | `referencia/60-dependencias-objetivo.md` |
| §70 APIs Angular a demostrar | `referencia/60-dependencias-objetivo.md` |
| §71 DoD frontend | `agents/53-definition-of-done.md` |
| §72 DoD backend | `agents/53-definition-of-done.md` |
| §73 DoD producto | `agents/53-definition-of-done.md` |
| §74 Cosas que no vamos a introducir | `00-vision-y-alcance.md` |
| §75 Narrativa técnica final | `referencia/61-narrativa-y-valor.md` |
| §76 Valor para entrevista | `referencia/61-narrativa-y-valor.md` |
| §77 Instrucciones para agentes | `agents/50-instrucciones-generales.md` |
| §78 Criterio dependencia nueva | `agents/51-criterio-dependencias.md` |
| §79 Criterio de modernización | `agents/52-criterio-modernizacion.md` |
| §80 Regla final | `referencia/61-narrativa-y-valor.md` |

---

## Mantenimiento

- Los documentos de `docs/` son **vivos**: si el plan cambia, se editan.
- `docs/archivo/brs-original.md` es **inmutable**.
- Cada sección conserva su numeración original (`## 42. …`) para poder citarla
  en PRs e issues: "según §42" sigue siendo inequívoco.
