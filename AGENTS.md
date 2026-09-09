# AGENTS.md — Día de Gachas

Punto de entrada para cualquier agente (o humano) que trabaje en este repositorio
durante el proceso de modernización.

Este fichero es **el router**: contexto mínimo + a dónde ir.
El detalle vive troceado en [`docs/`](./docs/README.md). **No cargues todo `docs/`**:
carga solo lo que la fase actual necesita.

---

## Qué es esto

Día de Gachas es una PWA que consulta la API de AEMET y responde a la única
pregunta que importa en Castilla-La Mancha: **¿hace día de gachas?**

Es una aplicación pequeña. La arquitectura puede ser seria; el producto no debe
convertirse en un ERP manchego.

---

## Stack actual (punto de partida)

```text
Frontend                          Backend
────────────────────────────      ────────────────────────────
Angular 19.2 (standalone)         NestJS 11
PrimeNG 19 + @primeng/themes      Prisma 7
PrimeIcons                        MariaDB / MySQL
tailwindcss-primeui               API AEMET (OpenData)
Tailwind CSS 4
Signals / resource()
SSR + hydration
Service Worker (PWA)
Jest
GSAP
zone.js
```

Estructura del monorepo:

```text
dia-gachas/
├── AGENTS.md          → este fichero (router)
├── CLAUDE.md          → apunta aquí
├── docs/              → documentación troceada de la migración
├── frontend/          → Angular
└── backend/           → NestJS + Prisma
```

Detalle fichero a fichero: [`docs/01-estado-actual.md`](./docs/01-estado-actual.md).

---

## Objetivo tras la migración

```text
Angular 19 + PrimeNG + NestJS + Prisma
                    ↓
       modernización incremental
                    ↓
Angular 22 + Angular primitives + ASP.NET Core + EF Core
```

```text
Frontend objetivo                 Backend objetivo
────────────────────────────      ────────────────────────────
Angular 22                        ASP.NET Core 10
Angular ARIA + CDK                Clean Architecture
HTML nativo + Tailwind            CQRS (MediatR)
Signals / httpResource            EF Core + MySQL
Zoneless + OnPush                 HybridCache + rate limiting
Vitest                            ProblemDetails
SSR + PWA (se mantienen)          Integración AEMET aislada y tipada
GSAP (se mantiene)                Docker + Coolify
PrimeNG = 0
```

Y una mejora funcional pequeña pero real:

> La aplicación no solo dirá **si** hace día de gachas, sino **por qué**
> (`score`, `reasons`, `bestForGachas`).

---

## Las 6 reglas que no se negocian

1. **Nadie reintroduce PrimeNG ni PrimeUI.** Ni "temporalmente", ni "solo este componente".
2. **No se avanza de fase por iniciativa propia.** Identifica la fase, haz esa fase, para.
3. **Se preserva el comportamiento** salvo cambio explícitamente documentado.
4. **Antes de una dependencia nueva:** HTML → primitive de Angular → CDK → y solo entonces
   plantear una dependencia externa pequeña.
5. **Un refactor debe mejorar algo concreto** (simplicidad, accesibilidad, tipado,
   testabilidad, performance, ownership, mantenibilidad, dependency footprint).
   "Esta API es nueva" no es una razón.
6. **Build y tests verdes antes de cerrar.** Y revisa tu propio diff.

---

## Flujo de trabajo del agente

```text
1. ¿En qué fase estamos?        → docs/plan/40-fases.md
2. Carga SOLO los docs de esa fase
3. Lee el código real (el doc describe el objetivo, no el presente)
4. Implementa sin mezclar fases
5. lint + test + build
6. Revisa el diff
7. Documenta cualquier desviación en el PR y en el doc correspondiente
```

Reglas completas: [`docs/agents/50-instrucciones-generales.md`](./docs/agents/50-instrucciones-generales.md).

### Ramas

- `main` → estado desplegable.
- `dev` → rama base de la migración. Todo PR de migración sale de `dev` y vuelve a `dev`.
- Un PR = una fase o menos. Ver [`docs/plan/41-estrategia-prs.md`](./docs/plan/41-estrategia-prs.md).

### Comandos

```bash
npm run install:all      # instala backend + frontend
npm run dev              # backend :3000 + frontend :4200 en paralelo

npm run lint:web         # eslint frontend
npm run test:web         # jest frontend (→ vitest tras la Fase 8)
npm run build:web        # build producción frontend

npm run lint:api         # eslint backend Nest
npm run test:api         # jest backend Nest
npm run build:api        # build backend Nest

npm run build            # api + web
```

Variables de entorno del backend: `backend/.env` (plantilla en `backend/.env.dist`)
→ `DATABASE_URL`, `AEMET_API_KEY`, `CORS_ORIGIN`.

---

## Mapa de la documentación

Índice completo y trazabilidad §1–§80: [`docs/README.md`](./docs/README.md).

| Necesitas… | Ve a |
|---|---|
| Por qué existe este plan y qué está fuera de alcance | [`docs/00-vision-y-alcance.md`](./docs/00-vision-y-alcance.md) |
| Qué hay hoy en el repo | [`docs/01-estado-actual.md`](./docs/01-estado-actual.md) |
| Subir de major Angular | [`docs/frontend/10-angular-upgrade.md`](./docs/frontend/10-angular-upgrade.md) |
| Estrategia de salida de PrimeNG | [`docs/frontend/11-primeng-decision.md`](./docs/frontend/11-primeng-decision.md) |
| Sustituir botones, iconos, labels, popover, toast | [`docs/frontend/12-primeng-sustituciones.md`](./docs/frontend/12-primeng-sustituciones.md) |
| Tokens y theming propios | [`docs/frontend/13-theming.md`](./docs/frontend/13-theming.md) |
| El autocomplete accesible (la pieza difícil) | [`docs/frontend/14-autocomplete-accesible.md`](./docs/frontend/14-autocomplete-accesible.md) |
| Zoneless, OnPush, httpResource, effects | [`docs/frontend/15-reactividad-signals.md`](./docs/frontend/15-reactividad-signals.md) |
| La nueva UI del veredicto y el share | [`docs/frontend/16-ui-veredicto-y-share.md`](./docs/frontend/16-ui-veredicto-y-share.md) |
| Tests y accesibilidad en frontend | [`docs/frontend/17-testing-frontend.md`](./docs/frontend/17-testing-frontend.md) |
| Montar el backend .NET | [`docs/backend/20-arquitectura.md`](./docs/backend/20-arquitectura.md) |
| EF Core y modelo de datos | [`docs/backend/21-persistencia.md`](./docs/backend/21-persistencia.md) |
| `GET /cities` e import de municipios | [`docs/backend/22-cities.md`](./docs/backend/22-cities.md) |
| Integración con AEMET | [`docs/backend/23-aemet.md`](./docs/backend/23-aemet.md) |
| Reglas de gachas y el "por qué" | [`docs/backend/24-dominio-gachas.md`](./docs/backend/24-dominio-gachas.md) |
| Contratos HTTP, errores y paridad | [`docs/backend/25-contratos-api.md`](./docs/backend/25-contratos-api.md) |
| Cache, rate limiting, health | [`docs/backend/26-resiliencia.md`](./docs/backend/26-resiliencia.md) |
| Tests de backend | [`docs/backend/27-testing-backend.md`](./docs/backend/27-testing-backend.md) |
| Docker y Coolify | [`docs/ops/30-docker-coolify.md`](./docs/ops/30-docker-coolify.md) |
| CI | [`docs/ops/31-ci.md`](./docs/ops/31-ci.md) |
| El plan de fases 0→23 | [`docs/plan/40-fases.md`](./docs/plan/40-fases.md) |
| Cómo trocear en PRs | [`docs/plan/41-estrategia-prs.md`](./docs/plan/41-estrategia-prs.md) |
| Cómo debe comportarse un agente | [`docs/agents/50-instrucciones-generales.md`](./docs/agents/50-instrucciones-generales.md) |
| Si puedo añadir una dependencia | [`docs/agents/51-criterio-dependencias.md`](./docs/agents/51-criterio-dependencias.md) |
| Si este refactor está justificado | [`docs/agents/52-criterio-modernizacion.md`](./docs/agents/52-criterio-modernizacion.md) |
| Cuándo está terminado | [`docs/agents/53-definition-of-done.md`](./docs/agents/53-definition-of-done.md) |
| Dependencias y APIs objetivo | [`docs/referencia/60-dependencias-objetivo.md`](./docs/referencia/60-dependencias-objetivo.md) |
| La narrativa final del proyecto | [`docs/referencia/61-narrativa-y-valor.md`](./docs/referencia/61-narrativa-y-valor.md) |
| El BRS original íntegro (congelado) | [`docs/archivo/brs-original.md`](./docs/archivo/brs-original.md) |

---

## Fuente de verdad y precedencia

```text
docs/**  (vivo, editable)     ← fuente de verdad
   ↑
AGENTS.md (router)
   ↑
docs/archivo/brs-original.md  ← congelado, solo trazabilidad histórica
```

Si `docs/` y el BRS congelado se contradicen, **gana `docs/`**.
Cada sección de `docs/` conserva su numeración original del BRS (`§42`), así que
se puede citar en PRs sin ambigüedad.

---

## Regla final

La arquitectura final debe parecer más profesional que la inicial.

La aplicación debe parecer igual de absurda.
