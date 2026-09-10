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

## Dos numeraciones, y no son la misma

Es la confusión fácil de este repo, así que queda dicha una vez:

| Símbolo | Qué es | Ejemplo |
|---|---|---|
| `NN-nombre.md` | **Número de fichero.** Ordena la documentación por temática. No significa nada más | `40-fases.md` es el plan de fases |
| `§N` | **Sección del BRS original.** Es una cita, no un orden. Por eso los `§` saltan dentro de un documento | `§40` es `SearchCities`, y vive en `backend/22-cities.md` |
| `§DN` | **Sección de la dirección de diseño.** Misma lógica, documento distinto | `§D18` es el Gachómetro, y vive en `diseno/75-pantallas.md` |
| `Fase N` / `Fase DN` | **Fases de trabajo.** La palabra `Fase` siempre está delante | `Fase 19` es del plan; `Fase D4` es del rediseño y se hace dentro de la 19 |

O sea: **`40-fases.md` y `§40` no tienen nada que ver.** Los números de fichero
van de 00 a 78 por temática; los `§` van de 1 a 80 siguiendo el BRS; los `§D`
van de 1 a 27 siguiendo la dirección de diseño.

Cuando cites algo en un PR o un issue, usa el `§`: es estable aunque los
documentos se reorganicen. Para decir "lee esto", usa la ruta del fichero.

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

### Diseño

> Dirección de arte del frontend. Se cita como `§DN`.

| Documento | Contenido |
|---|---|
| [`diseno/70-direccion-visual.md`](./diseno/70-direccion-visual.md) | **Empieza aquí.** Concepto Future Medieval Manchego, personalidad, filtro anti-AI-slop, qué se conserva |
| [`diseno/71-sistema-de-tokens.md`](./diseno/71-sistema-de-tokens.md) | Paleta, tipografía, espaciado, bordes y sombras, arquitectura de tokens, Tailwind v4 |
| [`diseno/72-composicion-y-layout.md`](./diseno/72-composicion-y-layout.md) | Papel en vez de card, composición editorial, responsive |
| [`diseno/73-marginalia-e-ilustracion.md`](./diseno/73-marginalia-e-ilustracion.md) | Marginalia, Dither Boy, motivos, tokens de ilustración |
| [`diseno/74-movimiento.md`](./diseno/74-movimiento.md) | Motion tokens, el "thunk", dónde sigue teniendo sentido GSAP |
| [`diseno/75-pantallas.md`](./diseno/75-pantallas.md) | Primitives propios, Home, Result, Gachómetro, sellos, clima, share |
| [`diseno/76-accesibilidad-visual.md`](./diseno/76-accesibilidad-visual.md) | Lo que la dirección de arte no puede romper |
| [`diseno/77-implantacion.md`](./diseno/77-implantacion.md) | Fases D1–D7, su mapeo a las fases 0–23 y la Definition of Done visual |
| [`diseno/78-reglas-agentes-ui.md`](./diseno/78-reglas-agentes-ui.md) | Debe / no debe al implementar UI, y qué leer según qué toques |

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
| [`archivo/direccion-diseno-original.md`](./archivo/direccion-diseno-original.md) | Dirección de diseño original íntegra. **Congelada.** Ídem |

---

## Trazabilidad BRS → documentos

Las 80 secciones del BRS original están repartidas sin pérdida. Mapa completo:

| BRS § | Documento |
|---|---|
| §1 · Propósito | `00-vision-y-alcance.md` |
| §2 · Principio rector | `00-vision-y-alcance.md` |
| §3 · Estado actual | `01-estado-actual.md` |
| §4 · Decisión sobre PrimeNG | `frontend/11-primeng-decision.md` |
| §5 · Filosofía de sustitución | `frontend/11-primeng-decision.md` |
| §6 · Huella actual de PrimeNG | `01-estado-actual.md` |
| §7 · Mapa de equivalencias UI | `frontend/12-primeng-sustituciones.md` |
| §8 · Botones | `frontend/12-primeng-sustituciones.md` |
| §9 · Iconos | `frontend/12-primeng-sustituciones.md` |
| §10 · Float label | `frontend/12-primeng-sustituciones.md` |
| §11 · Autocomplete de municipios | `frontend/14-autocomplete-accesible.md` |
| §12 · Componente CityAutocomplete | `frontend/14-autocomplete-accesible.md` |
| §13 · Signal Forms | `frontend/14-autocomplete-accesible.md` |
| §14 · Popover de créditos | `frontend/12-primeng-sustituciones.md` |
| §15 · Toast | `frontend/12-primeng-sustituciones.md` |
| §16 · Theming | `frontend/13-theming.md` |
| §17 · Tokens PrimeNG existentes | `frontend/13-theming.md` |
| §18 · Estrategia de transición | `frontend/11-primeng-decision.md` |
| §19 · Punto de salida de PrimeNG | `frontend/11-primeng-decision.md` |
| §20 · Angular 19 → 20 | `frontend/10-angular-upgrade.md` |
| §21 · Angular 20 → 21 | `frontend/10-angular-upgrade.md` |
| §22 · Retirada de PrimeNG (orden) | `frontend/11-primeng-decision.md` |
| §23 · Angular ARIA | `frontend/14-autocomplete-accesible.md` |
| §24 · Angular 21 → 22 | `frontend/10-angular-upgrade.md` |
| §25 · Objetivo Angular 22 | `frontend/10-angular-upgrade.md` |
| §26 · Zoneless | `frontend/15-reactividad-signals.md` |
| §27 · OnPush | `frontend/15-reactividad-signals.md` |
| §28 · WeatherResource actual | `frontend/15-reactividad-signals.md` |
| §29 · CitiesResource actual | `frontend/15-reactividad-signals.md` |
| §30 · Effects | `frontend/15-reactividad-signals.md` |
| §31 · linkedSignal | `frontend/15-reactividad-signals.md` |
| §32 · Animaciones | `frontend/15-reactividad-signals.md` |
| §33 · Testing frontend (runner) | `frontend/17-testing-frontend.md` |
| §34 · Backend objetivo | `backend/20-arquitectura.md` |
| §35 · Arquitectura | `backend/20-arquitectura.md` |
| §36 · Organización funcional | `backend/20-arquitectura.md` |
| §37 · CQRS | `backend/20-arquitectura.md` |
| §38 · Persistencia | `backend/21-persistencia.md` |
| §39 · EF Core | `backend/21-persistencia.md` |
| §40 · SearchCities | `backend/22-cities.md` |
| §41 · SearchCitiesQuery | `backend/22-cities.md` |
| §42 · ImportMunicipalityCatalogCommand | `backend/22-cities.md` |
| §43 · Weather actual | `backend/23-aemet.md` |
| §44 · Arquitectura Weather | `backend/23-aemet.md` |
| §45 · IAemetForecastProvider | `backend/23-aemet.md` |
| §46 · AemetForecastMapper | `backend/23-aemet.md` |
| §47 · Dominio de gachas | `backend/24-dominio-gachas.md` |
| §48 · Nueva funcionalidad | `backend/24-dominio-gachas.md` |
| §49 · Contrato Weather nuevo | `backend/25-contratos-api.md` |
| §50 · Typo launch/lunch | `backend/24-dominio-gachas.md` |
| §51 · Mejor día para gachas | `backend/24-dominio-gachas.md` |
| §52 · Angular consume Weather nuevo | `frontend/16-ui-veredicto-y-share.md` |
| §53 · UI del nuevo veredicto | `frontend/16-ui-veredicto-y-share.md` |
| §54 · Loading y errors sin PrimeNG | `frontend/15-reactividad-signals.md` |
| §55 · Share feedback | `frontend/16-ui-veredicto-y-share.md` |
| §56 · ProblemDetails | `backend/25-contratos-api.md` |
| §57 · Caching | `backend/26-resiliencia.md` |
| §58 · Rate limiting | `backend/26-resiliencia.md` |
| §59 · Healthcheck | `backend/26-resiliencia.md` |
| §60 · Testing backend | `backend/27-testing-backend.md` |
| §61 · Testing frontend (cobertura) | `frontend/17-testing-frontend.md` |
| §62 · Accessibility tests | `frontend/17-testing-frontend.md` |
| §63 · Contract parity | `backend/25-contratos-api.md` |
| §64 · Coolify | `ops/30-docker-coolify.md` |
| §65 · Docker | `ops/30-docker-coolify.md` |
| §66 · CI | `ops/31-ci.md` |
| §67 · Fases completas | `plan/40-fases.md` |
| §68 · Estrategia de PRs | `plan/41-estrategia-prs.md` |
| §69 · Dependencias objetivo frontend | `referencia/60-dependencias-objetivo.md` |
| §70 · APIs Angular a demostrar | `referencia/60-dependencias-objetivo.md` |
| §71 · DoD frontend | `agents/53-definition-of-done.md` |
| §72 · DoD backend | `agents/53-definition-of-done.md` |
| §73 · DoD producto | `agents/53-definition-of-done.md` |
| §74 · Cosas que no vamos a introducir | `00-vision-y-alcance.md` |
| §75 · Narrativa técnica final | `referencia/61-narrativa-y-valor.md` |
| §76 · Valor para entrevista | `referencia/61-narrativa-y-valor.md` |
| §77 · Instrucciones para agentes | `agents/50-instrucciones-generales.md` |
| §78 · Criterio dependencia nueva | `agents/51-criterio-dependencias.md` |
| §79 · Criterio de modernización | `agents/52-criterio-modernizacion.md` |
| §80 · Regla final | `referencia/61-narrativa-y-valor.md` |

---

## Trazabilidad dirección de diseño → documentos

Las 27 secciones de la dirección de diseño, repartidas sin pérdida:

| §D | Documento |
|---|---|
| §D1 · Contexto | `diseno/70-direccion-visual.md` |
| §D2 · Concepto rector | `diseno/70-direccion-visual.md` |
| §D3 · Personalidad | `diseno/70-direccion-visual.md` |
| §D4 · Principio anti-AI-slop | `diseno/70-direccion-visual.md` |
| §D5 · Qué conservamos | `diseno/70-direccion-visual.md` |
| §D6 · Superficie y composición | `diseno/72-composicion-y-layout.md` |
| §D7 · Paleta | `diseno/71-sistema-de-tokens.md` |
| §D8 · Tipografía | `diseno/71-sistema-de-tokens.md` |
| §D9 · Espaciado y layout | `diseno/71-sistema-de-tokens.md` |
| §D10 · Bordes, radios y sombras | `diseno/71-sistema-de-tokens.md` |
| §D11 · Marginalia y Dither Boy | `diseno/73-marginalia-e-ilustracion.md` |
| §D12 · Movimiento | `diseno/74-movimiento.md` |
| §D13 · Design system: arquitectura | `diseno/71-sistema-de-tokens.md` |
| §D14 · Tailwind CSS v4 | `diseno/71-sistema-de-tokens.md` |
| §D15 · Primitives propios | `diseno/75-pantallas.md` |
| §D16 · Home objetivo | `diseno/75-pantallas.md` |
| §D17 · Resultado objetivo | `diseno/75-pantallas.md` |
| §D18 · El Gachómetro | `diseno/75-pantallas.md` |
| §D19 · Veredicto y sellos | `diseno/75-pantallas.md` |
| §D20 · Clima como variante visual | `diseno/75-pantallas.md` |
| §D21 · Share-first | `diseno/75-pantallas.md` |
| §D22 · Accesibilidad | `diseno/76-accesibilidad-visual.md` |
| §D23 · Responsive | `diseno/72-composicion-y-layout.md` |
| §D24 · Plan de implantación | `diseno/77-implantacion.md` |
| §D25 · Definition of Done visual | `diseno/77-implantacion.md` |
| §D26 · Reglas para agentes | `diseno/78-reglas-agentes-ui.md` |
| §D27 · Resumen ejecutivo | `diseno/70-direccion-visual.md` |

### Dónde la dirección de diseño gana al BRS

| BRS | Dirección de diseño | Qué pasa |
|---|---|---|
| §53 "Mantener estética actual" | §D17 Resultado objetivo | **Superado en lo visual.** Lo funcional de §53 sigue vigente |
| §16 lista `--color-gachas-*` | §D7 Paleta | **Sustituido.** La intención de §16 se mantiene; los nombres y valores no |

Cualquier otra pareja es complementaria, no contradictoria.

### Qué es estado actual y qué es estado objetivo

Confusión fácil al leer documentación de migración: PPWoodland, Alegreya Sans, los
fondos full-bleed, el verde salvia y `text-surface-*` aparecen en varios documentos.
**Siempre como estado actual a retirar, nunca como destino.**

```text
ACTUAL (dev)                    OBJETIVO
─────────────────────────────   ──────────────────────────────────────
PPWoodland + Alegreya Sans   →  UnifrakturCook + Newsreader + IBM Plex Mono
#94aa8b de fondo             →  papel / tinta (--color-paper-50, --color-ink-900)
terracota #e15b2e            →  pimentón (--color-red-500)
paisajes full-bleed          →  composición editorial; ilustración opcional
text-surface-* de PrimeNG    →  tokens propios
light mode only              →  light-first
```

---

## Mantenimiento

- Los documentos de `docs/` son **vivos**: si el plan cambia, se editan.
- `docs/archivo/` es **inmutable**: tanto el BRS como la dirección de diseño originales.
- Cada sección conserva su numeración original (`## 42. …`) para poder citarla
  en PRs e issues: "según §42" sigue siendo inequívoco.
