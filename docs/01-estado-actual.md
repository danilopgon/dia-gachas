# 01 · Estado actual (punto de partida)

> Fuente: BRS §3, §6. Ampliado con el inventario real del repositorio.
> Índice general en [`docs/README.md`](./README.md).

---

## §3 · Estado actual

Frontend:

```text
Angular 19.2
PrimeNG 19
@primeng/themes
PrimeIcons
tailwindcss-primeui
Tailwind CSS 4
Signals
resource()
SSR / hydration
Service Worker
Jest
GSAP
```

Backend:

```text
NestJS
Prisma
MySQL / MariaDB
AEMET
```

La aplicación ya utiliza:

```text
signal()
computed()
effect()
model()
resource()
standalone components
modern control flow
```

Por tanto no se plantea reescribir Angular desde cero.

---

## §6 · Huella actual de PrimeNG

Los componentes principales a sustituir son:

### Home

```text
AutoComplete
FloatLabel
Button
```

El autocomplete es la única pieza realmente compleja.

### Result

```text
Button
Toast
```

### App shell

```text
Button
Popover
```

### Global

```text
Theme configuration
PrimeIcons
surface tokens
```

Por tanto la retirada debe abordarse componente a componente.

---

## Inventario del repositorio (referencia rápida)

Monorepo con npm workspaces manuales (`npm run` con `--prefix`):

```text
dia-gachas/
├── package.json          → scripts raíz (dev, build, test:api, test:web…)
├── frontend/             → Angular 19.2 + PrimeNG 19 + Tailwind 4 + Jest + GSAP + SSR + PWA
└── backend/              → NestJS 11 + Prisma 7 + MariaDB/MySQL + AEMET
```

Frontend (`frontend/src/app`):

```text
app.config.ts                                  → providers (incl. PrimeNG)
config/prime-ng-theme-settings.ts              → theme preset PrimeNG (a eliminar)
core/enums/gachas-level.enum.ts
core/models/city.interface.ts
core/models/weather-data.interface.ts
core/constants/gachas-messages.constant.ts
core/utils/get-random-gachas-message.util.ts
core/utils/weather-icon.util.ts
pages/home/home.component.*                    → AutoComplete + FloatLabel + Button
pages/home/resources/cities.resource.ts        → effect + setTimeout + resource + HttpClient
pages/result/result.component.*                → Button + Toast
pages/result/resources/weather.resource.ts     → resource + HttpClient + firstValueFrom
```

Backend (`backend/src`):

```text
main.ts
app.module.ts
shared/prisma.service.ts
modules/cities/cities.module.ts
modules/cities/controllers/cities.controller.ts
modules/cities/services/cities.service.ts
modules/weather/weather.module.ts
modules/weather/controllers/weather.controller.ts
modules/weather/services/aemet.service.ts      → HTTP + decoding + mapping + scoring (todo junto)
modules/weather/enums/gachas-level.enum.ts
modules/weather/models/{aemet-data,simplified-data,weather-request}.ts
modules/weather/errors/aemet.error.ts
prisma/schema.prisma                           → Province / City
```

Tests actuales (baseline a preservar):

```text
frontend: jest — cities.resource.spec, weather.resource.spec, home/result/app component specs, utils specs
backend:  jest — cities.service.spec, aemet.service.spec, prisma.service.spec
```

> Los specs de `aemet.service.spec.ts` son la **especificación de facto** de las
> reglas de gachas. Se portan a `DiaGachas.Domain.Tests` **antes** de tocar reglas.
> Ver [`backend/24-dominio-gachas.md`](./backend/24-dominio-gachas.md).

---

## Estado visual actual (punto de partida del rediseño)

Lo que hay hoy en el repo, verificado, y contra lo que trabaja
[`diseno/70-direccion-visual.md`](./diseno/70-direccion-visual.md) §D1:

```text
frontend/src/styles.css
├── @import "primeicons/primeicons.css"     → se va con PrimeNG
├── @config "../tailwind.config.js"
├── @font-face PPWoodland  (PPWoodland-Bold.otf)
├── @font-face Alegreya    (AlegreyaSans-Regular.ttf, cargada como 'Alegreya')
├── body { background-color: #94aa8b }      → verde salvia hardcodeado
├── @keyframes fade-up / float-gentle       → expuestas vía @theme
└── @media (prefers-reduced-motion)         → ya soportado, conservar
```

Dependencias visuales a retirar:

```text
7 usos de text-surface-*  en 2 ficheros (home y result)
5 hexadecimales sueltos   en templates
2 fondos full-bleed       bg-[url('/assets/images/fondo-main.webp')] y fondo-cielo.webp
providePrimeNG(...)       en app.config.ts + config/prime-ng-theme-settings.ts
```

Assets existentes reutilizables como material de marca (§D5):

```text
public/assets/images/  fondo-main, fondo-cielo, fondo-sol,
                       fondo-colinas, fondo-colinas-frente, fondo-tiempo-desktop
public/assets/icons/   icon-sun, icon-cloud, icon-rain, icon-snow, icon-storm
public/assets/fonts/   PPWoodland-Bold.otf, AlegreyaSans-Regular.ttf
```

> `frontend/.impeccable.md` describe la dirección visual **anterior** (los paisajes
> como referencia obligatoria, paleta terracota `#e15b2e` + salvia `#94aa8b`).
> Queda subordinado a `docs/diseno/`; ver
> [`diseno/77-implantacion.md`](./diseno/77-implantacion.md) §D24, fase D7.

---

## Documentos relacionados

- Decisión sobre PrimeNG: [`frontend/11-primeng-decision.md`](./frontend/11-primeng-decision.md)
- Sustituciones UI concretas: [`frontend/12-primeng-sustituciones.md`](./frontend/12-primeng-sustituciones.md)
- Weather actual y su descomposición: [`backend/23-aemet.md`](./backend/23-aemet.md)
- Recursos reactivos actuales: [`frontend/15-reactividad-signals.md`](./frontend/15-reactividad-signals.md)
- Hacia dónde va la UI: [`diseno/70-direccion-visual.md`](./diseno/70-direccion-visual.md)
