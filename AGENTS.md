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

Y una dirección de arte propia: **Future Medieval Manchego / Vernacular Editorial**
— bando municipal × recetario castellano × grabado medieval × estación meteorológica
× fanzine contemporáneo. La UI deja de parecer una app del tiempo personalizada.

```text
UnifrakturCook + Newsreader + IBM Plex Mono
papel / tinta / pimentón
composición editorial
marginalia dither (Dither Boy, en diseño; nunca en runtime)
80 % editorial · 15 % dither/textura · 5 % medieval explícito
```

Ver [`docs/diseno/70-direccion-visual.md`](./docs/diseno/70-direccion-visual.md).

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
7. **Si tocas UI, la dirección de arte manda.** Nada de cards genéricas, gradientes,
   radios grandes, sombras suaves ni pills. Tokens antes que hexadecimales sueltos.
   Filtro: *¿podría esta pantalla salir de una landing generada para cualquier startup?*
   Si sí, no vale. → [`docs/diseno/78-reglas-agentes-ui.md`](./docs/diseno/78-reglas-agentes-ui.md)

---

## Flujo de trabajo del agente

```text
1. ./scripts/migration-status.sh    → en qué fase estamos (lo dice el repo, no un doc)
2. docs/plan/42-estado.md           → PRs, fechas y protocolo de apertura/cierre
3. Carga SOLO los docs de esa fase
4. Lee el código real (el doc describe el objetivo, no el presente)
5. Implementa sin mezclar fases
6. lint + test + build
7. El script debe pasar la fase a ✅ solo. Si no, no está hecha
8. Revisa el diff, actualiza 42-estado.md y anota desviaciones en 43-bitacora.md
```

### Cómo sabemos en qué punto estamos

El estado **se deriva del repositorio**, no de un fichero que alguien tiene que
acordarse de actualizar:

```bash
./scripts/migration-status.sh
```

Compara lo que dice el código (versión de Angular, si queda PrimeNG, si existe
`GachasScoringPolicy`…) con lo declarado en `docs/plan/42-estado.md`, y avisa
cuando no coinciden. **Si hay discrepancia, gana el código.**

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

./scripts/migration-status.sh   # estado de la migración, derivado del repo
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
| **Qué aspecto tiene todo esto** | [`docs/diseno/70-direccion-visual.md`](./docs/diseno/70-direccion-visual.md) |
| Colores, tipos, espaciado, sombras | [`docs/diseno/71-sistema-de-tokens.md`](./docs/diseno/71-sistema-de-tokens.md) |
| Componer una pantalla | [`docs/diseno/72-composicion-y-layout.md`](./docs/diseno/72-composicion-y-layout.md) |
| Iconos, ilustración, marginalia | [`docs/diseno/73-marginalia-e-ilustracion.md`](./docs/diseno/73-marginalia-e-ilustracion.md) |
| Animación y transiciones | [`docs/diseno/74-movimiento.md`](./docs/diseno/74-movimiento.md) |
| Home, Result, Gachómetro, sellos | [`docs/diseno/75-pantallas.md`](./docs/diseno/75-pantallas.md) |
| Accesibilidad de la dirección visual | [`docs/diseno/76-accesibilidad-visual.md`](./docs/diseno/76-accesibilidad-visual.md) |
| Cuándo se hace cada parte del rediseño | [`docs/diseno/77-implantacion.md`](./docs/diseno/77-implantacion.md) |
| Reglas al implementar UI | [`docs/diseno/78-reglas-agentes-ui.md`](./docs/diseno/78-reglas-agentes-ui.md) |
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
| En qué fase estamos y qué se decidió | [`docs/plan/42-estado.md`](./docs/plan/42-estado.md) |
| El plan de fases 0→23 y sus señales de verificación | [`docs/plan/40-fases.md`](./docs/plan/40-fases.md) |
| Por qué nos desviamos del plan aquel día | [`docs/plan/43-bitacora.md`](./docs/plan/43-bitacora.md) |
| Cómo trocear en PRs | [`docs/plan/41-estrategia-prs.md`](./docs/plan/41-estrategia-prs.md) |
| Cómo debe comportarse un agente | [`docs/agents/50-instrucciones-generales.md`](./docs/agents/50-instrucciones-generales.md) |
| Si puedo añadir una dependencia | [`docs/agents/51-criterio-dependencias.md`](./docs/agents/51-criterio-dependencias.md) |
| Si este refactor está justificado | [`docs/agents/52-criterio-modernizacion.md`](./docs/agents/52-criterio-modernizacion.md) |
| Cuándo está terminado | [`docs/agents/53-definition-of-done.md`](./docs/agents/53-definition-of-done.md) |
| Dependencias y APIs objetivo | [`docs/referencia/60-dependencias-objetivo.md`](./docs/referencia/60-dependencias-objetivo.md) |
| La narrativa final del proyecto | [`docs/referencia/61-narrativa-y-valor.md`](./docs/referencia/61-narrativa-y-valor.md) |
| El BRS original íntegro (congelado) | [`docs/archivo/brs-original.md`](./docs/archivo/brs-original.md) |
| La dirección de diseño original (congelada) | [`docs/archivo/direccion-diseno-original.md`](./docs/archivo/direccion-diseno-original.md) |

---

## Fuente de verdad y precedencia

```text
docs/**  (vivo, editable)     ← fuente de verdad
   ↑
AGENTS.md (router)

docs/archivo/*                ← congelados, solo trazabilidad histórica
frontend/.impeccable.md       ← dirección visual anterior, subordinada a docs/diseno/
```

Si `docs/` y el BRS congelado se contradicen, **gana `docs/`**.

Ojo con las dos numeraciones, que no son la misma:

- `NN-nombre.md` → **número de fichero**, ordena la documentación por temática.
- `§N` → **sección del BRS original**, es una cita. Por eso los `§` saltan dentro
  de un documento: `00-vision-y-alcance.md` contiene `§1`, `§2` y `§74`, y está bien.
- `§DN` → **sección de la dirección de diseño**. `§D18` es el Gachómetro.
- `Fase N` / `Fase DN` → fases de trabajo; la palabra `Fase` siempre va delante.

`40-fases.md` y `§40` no tienen relación alguna. Para citar en un PR usa el `§`
(sobrevive a reorganizaciones); para decir "lee esto", usa la ruta del fichero.

### Dónde la dirección de diseño gana al BRS

Solo en dos sitios, y ambos están anotados en el documento afectado:

- **§53** "mantener estética actual" → superado por **§D17**. Lo funcional de §53 sigue.
- **§16** lista `--color-gachas-*` → sustituida por **§D7**. La intención de §16 sigue.

En todo lo demás son complementarios: el BRS dice qué hace la app, la dirección de
diseño dice qué aspecto tiene.

---

## Regla final

La arquitectura final debe parecer más profesional que la inicial.

La aplicación debe parecer igual de absurda.
