<!--
  DOCUMENTO CONGELADO — NO EDITAR.

  Este es el BRS original ("Día de Gachas — Plan integral de modernización"),
  conservado íntegro por trazabilidad histórica.

  NO es la fuente de verdad operativa. La fuente de verdad viva es el conjunto
  de documentos de `docs/`, indexado desde `AGENTS.md` y `docs/README.md`.

  Si detectas una discrepancia entre este archivo y `docs/`, gana `docs/`.
  Los agentes NO deben cargar este archivo salvo para auditar trazabilidad.
-->

# Día de Gachas — Plan integral de modernización

## Angular 19 → Angular 22  
## Retirada de PrimeNG  
## NestJS/Prisma → ASP.NET Core/EF Core  
## Nueva explicación del veredicto de gachas

---

# 1. Propósito

Este documento define la modernización completa de **Día de Gachas**.

El proyecto combinará tres líneas de trabajo relacionadas:

1. **Modernización frontend**
   - Angular 19 → Angular 22.
   - adopción selectiva de APIs modernas del framework;
   - Zoneless;
   - OnPush;
   - `httpResource`;
   - modernización del modelo reactivo;
   - migración de Jest a Vitest cuando resulte razonable.

2. **Retirada completa de PrimeNG**
   - no adoptar PrimeNG 22;
   - sustituir componentes PrimeNG por HTML nativo, Tailwind CSS y primitives oficiales de Angular;
   - eliminar también PrimeIcons, themes PrimeNG y cualquier integración específica de PrimeUI.

3. **Migración backend**
   - NestJS/Prisma → ASP.NET Core/EF Core;
   - Clean Architecture;
   - CQRS;
   - módulos funcionales;
   - integración AEMET aislada;
   - testing;
   - despliegue containerizado en Coolify.

Además, la migración incorporará una pequeña mejora funcional:

> La aplicación no solo dirá si hace día de gachas, sino que explicará **por qué**.

El objetivo profesional es que el proyecto pueda demostrar una modernización full-stack real:

```text
Angular 19 + PrimeNG + NestJS + Prisma
                    ↓
       modernización incremental
                    ↓
Angular 22 + Angular primitives + ASP.NET Core + EF Core
```

---

# 2. Principio rector

Día de Gachas seguirá siendo una aplicación pequeña.

La arquitectura puede ser seria.

El producto no debe convertirse en un ERP manchego.

La regla será:

> Añadir sofisticación cuando demuestre ingeniería, mejore mantenibilidad, fiabilidad, accesibilidad o producto.

No:

> Añadir patrones porque existen.

---

# 3. Estado actual

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

# 4. Decisión sobre PrimeNG

No se adoptará PrimeNG 22.

El objetivo final es:

```text
PrimeNG dependencies = 0
```

Eliminar:

```text
primeng
@primeng/themes
primeicons
tailwindcss-primeui
```

Y cualquier:

```text
providePrimeNG(...)
PrimeNG config
PrimeNG theme preset
PrimeNG MessageService
PrimeNG templates
p-button
p-autocomplete
p-floatlabel
p-popover
p-toast
```

La UI quedará bajo control directo del proyecto.

---

# 5. Filosofía de sustitución de PrimeNG

No sustituir una component library grande por otra component library grande.

Preferencia:

```text
HTML nativo
+
Tailwind CSS
+
Angular
+
Angular ARIA
+
Angular CDK cuando sea necesario
```

Angular 22 proporciona primitives oficiales para patrones accesibles como combobox/listbox mediante `@angular/aria`, combinables con CDK Overlay. Esto encaja especialmente bien con el autocomplete de municipios.

No crear un design system genérico.

Crear únicamente primitives que Día de Gachas necesite.

---

# 6. Huella actual de PrimeNG

Los componentes principales a sustituir son:

## Home

```text
AutoComplete
FloatLabel
Button
```

El autocomplete es la única pieza realmente compleja.

## Result

```text
Button
Toast
```

## App shell

```text
Button
Popover
```

## Global

```text
Theme configuration
PrimeIcons
surface tokens
```

Por tanto la retirada debe abordarse componente a componente.

---

# 7. Mapa de equivalencias UI

| PrimeNG | Sustitución |
|---|---|
| `p-button` | `<button>` / `<a>` nativo + Tailwind |
| `p-floatlabel` | `<label>` + `<input>` propio |
| `p-autocomplete` | Angular ARIA Combobox + Listbox + CDK Overlay |
| `p-popover` | HTML Popover API o pequeño componente propio |
| `p-toast` | signal-based toast / live region |
| `MessageService` | servicio propio mínimo |
| `PrimeIcons` | SVG inline propios |
| PrimeNG themes | CSS variables + Tailwind |
| `text-surface-*` | tokens propios |

---

# 8. Botones

Los botones no justifican dependencia alguna.

Sustituir:

```html
<p-button />
```

por:

```html
<button type="button">
```

estilado con Tailwind.

Crear, si evita duplicación real:

```text
ButtonComponent
```

Pero solo si existe suficiente repetición.

No construir:

```text
ButtonModule
ButtonDirective
ButtonService
ButtonFactory
```

para tres botones.

---

# 9. Iconos

Los iconos utilizados son muy pocos:

```text
search
share
info
```

No introducir otra icon library completa salvo que el número crezca significativamente.

Preferencia:

```text
SVG inline
```

o pequeños componentes:

```text
SearchIcon
ShareIcon
InfoIcon
```

Esto permite eliminar:

```text
primeicons
```

completamente.

---

# 10. Float label

El `p-floatlabel` actual se reemplazará por markup propio.

Preferencia:

```text
label accesible
input
Tailwind
```

La estética puede conservar el efecto flotante mediante CSS si merece la pena.

La funcionalidad y accesibilidad tienen prioridad sobre clonar exactamente el componente PrimeNG.

---

# 11. Autocomplete de municipios

Es la sustitución más importante.

La solución objetivo en Angular moderno será:

```text
query signal
      ↓
debounce
      ↓
httpResource
      ↓
cities
      ↓
Angular ARIA Combobox
      +
Angular ARIA Listbox
      +
CDK Connected Overlay
```

Debe soportar correctamente:

```text
teclado
ArrowUp / ArrowDown
Enter
Escape
focus
screen readers
active descendant
selección
loading
sin resultados
```

No implementar accesibilidad manualmente si Angular ya proporciona primitives oficiales.

---

# 12. Componente CityAutocomplete

Crear un componente específico:

```text
CityAutocompleteComponent
```

No:

```text
GenericAutocomplete<T>
```

al menos inicialmente.

API aproximada:

```text
query
selectedCity
cities
loading
error
```

El componente debe ser reusable dentro de Día de Gachas, no intentar convertirse en librería pública.

---

# 13. Signal Forms

Evaluar utilizar Signal Forms para el selector de municipio.

Puede encapsular:

```text
query
selectedCity
validation
debounce
```

Si mejora realmente el código, será uno de los ejemplos deliberados de Angular 22 en el proyecto.

Si la combinación con Angular ARIA resulta más clara mediante signals directos, no forzar Signal Forms.

El objetivo es código idiomático, no una checklist.

---

# 14. Popover de créditos

Actualmente existe un botón flotante que abre créditos, enlaces y atribución AEMET.

Se reemplazará preferentemente mediante:

```text
HTML Popover API
```

si el soporte de browsers objetivo resulta suficiente.

Alternativa:

```text
pequeño componente + CDK Overlay
```

No utilizar una librería externa para un único panel informativo.

---

# 15. Toast

Actualmente se utiliza PrimeNG Toast principalmente para comunicar que un enlace se ha copiado.

Esto no necesita una infraestructura grande.

Crear:

```text
ToastService
```

signal-based, con algo aproximado a:

```text
message = signal<ToastMessage | null>(null)
```

y:

```text
ToastComponent
```

o incluso un simple live region global.

Debe:

- ser accesible;
- usar `aria-live`;
- desaparecer automáticamente;
- soportar únicamente los casos reales del producto.

No recrear toda la API de PrimeNG Toast.

---

# 16. Theming

Eliminar:

```text
@primeng/themes
definePreset
providePrimeNG
tailwindcss-primeui
```

La identidad visual pasa a ser propiedad de Día de Gachas.

Definir pocos tokens propios:

```css
--color-gachas-primary
--color-gachas-surface
--color-gachas-text
--color-gachas-accent
--radius-control
--shadow-control
```

Integrarlos con Tailwind cuando sea útil.

No crear centenares de design tokens.

---

# 17. Tokens PrimeNG existentes

El frontend utiliza actualmente clases como:

```text
text-surface-50
```

Estas dependencias visuales deben localizarse y eliminarse.

Sustituirlas por:

```text
tokens propios
o
colores Tailwind explícitos semánticos del proyecto
```

La retirada de PrimeNG no está terminada mientras el CSS siga dependiendo conceptualmente del theme PrimeNG.

---

# 18. Estrategia de transición PrimeNG

No intentar actualizar directamente:

```text
PrimeNG 19 → PrimeNG 22
```

La versión 22 nunca será estado objetivo.

La secuencia recomendada será:

```text
Angular 19 + PrimeNG 19
        ↓
Angular 20 + dependencia UI compatible temporal
        ↓
Angular 21 + dependencia UI compatible temporal
        ↓
retirada completa PrimeNG
        ↓
Angular 21 sin PrimeNG
        ↓
Angular 22
```

Si los peer dependencies obligan a actualizar PrimeNG 19 → 20 → 21 temporalmente durante los majors Angular, está permitido.

Esas versiones serán únicamente **dependencies de transición**.

No se desarrollará nueva UI PrimeNG durante ese periodo.

---

# 19. Punto de salida de PrimeNG

PrimeNG debe desaparecer **antes de considerar terminado el salto a Angular 22**.

Definition:

```text
npm dependency tree
→ ninguna dependencia PrimeNG/PrimeUI
```

Y:

```text
grep "primeng"
→ 0 código de aplicación
```

salvo documentación histórica de la migración.

---

# 20. Angular 19 → 20

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

# 21. Angular 20 → 21

Después:

```bash
ng update @angular/core@21 @angular/cli@21
```

Mismo procedimiento.

Estabilizar completamente antes de abordar PrimeNG.

---

# 22. Retirada de PrimeNG

La retirada se realizará preferentemente sobre Angular 21, donde ya están disponibles varias primitives modernas que facilitan la sustitución.

Orden:

```text
1. Button
2. icons
3. FloatLabel
4. Popover
5. Toast
6. theme
7. AutoComplete
8. eliminar dependencias
```

El autocomplete se deja para el final por ser la pieza con mayor riesgo funcional/accesible.

---

# 23. Angular ARIA

Para el autocomplete utilizar primitives oficiales:

```text
@angular/aria/combobox
@angular/aria/listbox
@angular/cdk/overlay
```

El objetivo es delegar en Angular:

```text
focus management
ARIA semantics
keyboard navigation
active option
selection behavior
```

y dejar al proyecto:

```text
datos
estilos
producto
```

---

# 24. Angular 21 → 22

Una vez PrimeNG ya no exista:

```bash
ng update @angular/core@22 @angular/cli@22
```

El último major queda desacoplado de cualquier component library externa.

Esto reduce muchísimo el coste futuro de upgrades Angular.

---

# 25. Objetivo Angular 22

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

# 26. Zoneless

Eliminar:

```text
zone.js
provideZoneChangeDetection(...)
```

La aplicación debe funcionar naturalmente mediante signals y mecanismos compatibles con Zoneless.

Auditar especialmente:

```text
GSAP
native popover
toast timers
share API
clipboard
overlay
SSR
service worker
```

---

# 27. OnPush

Angular 22 debe trabajar naturalmente con OnPush.

Buscar cualquier compatibilidad temporal:

```text
ChangeDetectionStrategy.Default
ChangeDetectionStrategy.Eager
```

y eliminarla salvo motivo documentado.

Estado mutable de aplicación preferentemente mediante:

```text
signal.set()
signal.update()
```

---

# 28. WeatherResource actual

Actualmente Weather combina:

```text
resource()
HttpClient
firstValueFrom()
manual loader
```

Se modernizará a:

```text
httpResource
```

Flujo:

```text
municipalityCode
       ↓
httpResource
       ↓
GET /weather/{code}
```

El componente consumidor trabajará directamente con:

```text
value()
isLoading()
error()
reload()
```

---

# 29. CitiesResource actual

Actualmente la búsqueda realiza manualmente:

```text
effect
setTimeout
clearTimeout
resource
HttpClient
firstValueFrom
```

Esto se simplificará.

Objetivo:

```text
query
 ↓
debounce
 ↓
httpResource
 ↓
cities
```

Si Signal Forms aporta una solución clara al debounce, utilizarla.

Si no:

```text
signal + RxJS interoperability
```

también es válida.

---

# 30. Effects

Auditar todos los `effect()`.

Mantener únicamente efectos reales.

Ejemplos legítimos:

```text
DOM
analytics
imperative GSAP integration
external browser APIs
```

No usar `effect` para:

```text
A cambia
→ escribir B
```

si puede expresarse mediante:

```text
computed
linkedSignal
resource
```

---

# 31. linkedSignal

Evaluar `linkedSignal` para estados derivados que necesiten conservar conocimiento del valor anterior.

Ejemplo potencial:

```text
último listado válido de ciudades
```

No introducirlo donde una simple `computed()` sea suficiente.

---

# 32. Animaciones

Mantener:

```text
GSAP
```

para animaciones complejas ya existentes.

Para pequeñas transiciones UI:

```text
CSS
animate.enter
animate.leave
```

Evitar nuevas dependencias de:

```text
@angular/animations
```

y retirar `provideAnimationsAsync()` cuando ya no sea necesario.

La eliminación de PrimeNG probablemente facilitará también esta limpieza.

---

# 33. Testing frontend

Estado actual:

```text
Jest
```

Estado objetivo preferente:

```text
Vitest
```

Secuencia:

```text
Angular estable
→ PrimeNG eliminado
→ tests funcionando
→ Jest → Vitest
```

No mezclar test runner migration con component migration.

---

# 34. Backend objetivo

Crear:

```text
backend-dotnet/
├── src/
│   ├── DiaGachas.Api/
│   ├── DiaGachas.Application/
│   ├── DiaGachas.Domain/
│   └── DiaGachas.Infrastructure/
│
└── tests/
    ├── DiaGachas.Domain.Tests/
    ├── DiaGachas.Application.Tests/
    ├── DiaGachas.IntegrationTests/
    └── DiaGachas.ArchitectureTests/
```

---

# 35. Arquitectura

Dependencias:

```text
Domain
  ↑
Application
  ↑
Infrastructure

Api
 ├── Application
 └── Infrastructure
```

Domain no conoce:

```text
ASP.NET
EF Core
HTTP
JSON
AEMET
MySQL
MediatR
```

---

# 36. Organización funcional

No organizar exclusivamente:

```text
Controllers/
Services/
Repositories/
Dtos/
```

Organizar por feature:

```text
Application/
├── Cities/
│   ├── SearchCities/
│   └── ImportMunicipalityCatalog/
│
└── Weather/
    └── GetWeatherForecast/
```

---

# 37. CQRS

Queries:

```text
SearchCitiesQuery
GetWeatherForecastQuery
```

Command:

```text
ImportMunicipalityCatalogCommand
```

No crear commands para lecturas.

No separar físicamente read/write DBs.

No event sourcing.

---

# 38. Persistencia

Modelo:

```text
Province
├── Id
└── Name

City
├── Id
├── Name
└── ProvinceId
```

IDs siguen siendo strings.

Motivo:

```text
preservar ceros iniciales de códigos AEMET
```

---

# 39. EF Core

EF Core será dueño completo del nuevo schema.

No:

```text
GenericRepository
UnitOfWork wrapper
```

Utilizar `DbContext` directamente donde corresponda.

Base temporal:

```text
dia_gachas_dotnet
```

separada del schema Prisma.

---

# 40. SearchCities

Mantener:

```http
GET /cities?name=Cue
```

Respuesta:

```json
{
  "status": "ok",
  "data": [
    {
      "id": "16078",
      "name": "Cuenca",
      "provinceId": "16",
      "province": {
        "id": "16",
        "name": "Cuenca"
      }
    }
  ]
}
```

Sin resultados:

```json
{
  "status": "ok",
  "data": []
}
```

No reproducir pseudo-404 en body.

---

# 41. SearchCitiesQuery

Debe utilizar:

```text
Trim
validation
CancellationToken
AsNoTracking
projection
limit
stable ordering
```

Está diseñado para autocomplete.

No devolver relaciones innecesarias.

---

# 42. ImportMunicipalityCatalogCommand

Los datos de municipios y provincias son reproducibles.

Crear command idempotente:

```text
JSON
 ↓
ImportMunicipalityCatalogCommand
 ↓
EF Core
 ↓
Province / City
```

Debe:

- insertar;
- actualizar nombres;
- evitar duplicados;
- ejecutarse explícitamente;
- soportar una DB vacía.

---

# 43. Weather actual

Actualmente una sola pieza realiza:

```text
HTTP AEMET
decoding
mapping
temperature calculation
rain calculation
sky interpretation
gachas scoring
```

Esto se separará.

---

# 44. Arquitectura Weather

Objetivo:

```text
AemetForecastProvider
         ↓
AemetForecastMapper
         ↓
WeatherConditions
         ↓
GachasScoringPolicy
         ↓
GachasVerdict
```

---

# 45. IAemetForecastProvider

Application define:

```text
IAemetForecastProvider
```

Infrastructure implementa:

```text
AemetForecastProvider
```

Responsable de:

```text
HttpClient
API key
timeouts
two-step AEMET flow
Latin-1
deserialization
external failures
```

No contiene reglas de gachas.

---

# 46. AemetForecastMapper

Transforma:

```text
AEMET DTO
      ↓
internal forecast
```

Mantener comportamiento inicial:

```text
primeros dos días
temperatura 12 / 18
corrected mean
anomalous zero protection
rain-slot priority
sky description
```

---

# 47. Dominio de gachas

Crear:

```text
WeatherConditions
GachasLevel
GachasVerdict
GachasScoringPolicy
```

Portar los tests existentes como especificación antes de modificar reglas.

---

# 48. Nueva funcionalidad

Actualmente:

```text
GachasLevel
```

Nuevo dominio:

```text
GachasVerdict
├── Score
├── Level
└── Reasons
```

Ejemplo:

```json
{
  "score": 6,
  "level": "high",
  "reasons": [
    "Hace bastante frío",
    "Hay alta probabilidad de lluvia",
    "El cielo estará cubierto"
  ]
}
```

---

# 49. Contrato Weather nuevo

Mantener compatibilidad:

```json
{
  "status": "ok",
  "data": [
    {
      "town": "Cuenca",
      "province": "Cuenca",
      "date": "2026-09-09",

      "launchTemperature": 12,
      "launchTimeRainProbability": 70,
      "skyStatus": "Cubierto",
      "gachasLevel": "high",

      "gachasScore": 6,
      "gachasReasons": [
        "Hace bastante frío",
        "Hay alta probabilidad de lluvia",
        "El cielo estará cubierto"
      ],

      "bestForGachas": true
    }
  ]
}
```

Los nuevos campos son aditivos.

---

# 50. Typo launch/lunch

No propagar internamente:

```text
launchTemperature
```

Dominio:

```text
LunchTemperature
```

DTO de compatibilidad:

```text
launchTemperature
```

El typo se conserva únicamente mientras sea necesario por compatibilidad pública.

---

# 51. Mejor día para gachas

Comparar los dos días ya procesados.

Añadir:

```text
bestForGachas
```

No ampliar scope.

No:

```text
forecast 7 días
cuentas
favoritos
notificaciones
```

---

# 52. Angular consume Weather nuevo

El frontend Angular 22 debe derivar:

```text
today
tomorrow
score
reasons
bestDay
icon
message
```

mediante:

```text
computed()
```

siempre que sea posible.

Evitar estado duplicado.

---

# 53. UI del nuevo veredicto

Mantener estética actual.

Añadir:

```text
HOY ES DÍA DE GACHAS

¿Por qué?

🥶 Hace bastante frío
🌧️ Alta probabilidad de lluvia
☁️ Cielo cubierto

Score gachero: 6/6
```

Y opcionalmente:

```text
Mañana pinta todavía mejor
```

No rediseñar toda la pantalla.

---

# 54. Loading y errors sin PrimeNG

`httpResource` proporcionará el estado async.

Templates:

```text
@if (resource.isLoading()) {}
@else if (resource.error()) {}
@else if (resource.hasValue()) {}
```

No depender de componentes UI externos para estos estados.

---

# 55. Share feedback

Al copiar enlace:

```text
navigator.clipboard
      ↓
ToastService propio
      ↓
aria-live
```

Si `navigator.share` está disponible:

```text
Web Share API
```

La experiencia actual se mantiene sin PrimeNG MessageService.

---

# 56. ProblemDetails

Backend utilizará semántica HTTP real:

```text
400 invalid input
404 resource missing
429 rate limit
502 AEMET unavailable
500 unexpected error
```

y:

```text
ProblemDetails
```

Angular deberá mapear esos errores a mensajes de producto.

---

# 57. Caching

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

# 58. Rate limiting

Aplicar policies diferenciadas.

```text
Cities
→ suficientemente permisivo para autocomplete

Weather
→ más restrictivo
```

---

# 59. Healthcheck

```http
GET /health
```

No consultar AEMET.

Un proveedor externo caído no significa que el container esté muerto.

---

# 60. Testing backend

## Domain

```text
GachasScoringPolicy
```

## Application

```text
SearchCities
GetWeatherForecast
ImportMunicipalityCatalog
```

## Infrastructure

```text
AemetForecastMapper
AemetForecastProvider
EF mappings
```

## Integration

```text
WebApplicationFactory
Testcontainers MySQL
```

## Architecture

Verificar boundaries Clean.

---

# 61. Testing frontend

Cubrir:

```text
CityAutocomplete
CitiesResource
WeatherResource
HomeComponent
ResultComponent
Toast
loading
errors
keyboard autocomplete
selection
new Weather fields
reasons
best day
```

Especial atención a accesibilidad del autocomplete.

---

# 62. Accessibility tests

La retirada de PrimeNG convierte al proyecto en responsable directo de su UI.

Por tanto deben comprobarse:

```text
keyboard navigation
focus
labels
aria-live
combobox semantics
listbox semantics
disabled states
error announcements
```

No considerar terminada la sustitución del autocomplete únicamente porque “se puede clicar”.

---

# 63. Contract parity

Durante coexistencia:

```text
Nest
GET /cities
GET /weather

vs

.NET
GET /cities
GET /weather
```

Normalizar y comparar.

Documentar diferencias deliberadas.

---

# 64. Coolify

Durante la migración:

```text
Coolify
│
├── frontend-angular
├── api-nest
├── api-dotnet
└── mysql
```

Nuevo backend:

```text
/backend-dotnet
Dockerfile
port 8080
/health
```

---

# 65. Docker

Multi-stage:

```text
.NET SDK
   ↓
publish
   ↓
ASP.NET runtime
```

El container debe ser portable.

No depender de APIs específicas de Coolify.

---

# 66. CI

Frontend:

```text
install
lint
typecheck
test
build
```

Backend:

```text
restore
build
test
docker build
```

Añadir contract tests cuando ambas APIs existan.

---

# 67. Fases completas

## Fase 0 — Baseline

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

## Fase 1 — Angular 20

Upgrade framework.

Cambios mínimos.

---

## Fase 2 — Angular 21

Upgrade framework.

Mantener todavía UI funcional.

---

## Fase 3 — PrimeNG removal: primitives

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

---

## Fase 4 — Autocomplete

Construir:

```text
Angular ARIA Combobox
Angular ARIA Listbox
CDK Overlay
httpResource
```

Probar teclado y accesibilidad.

---

## Fase 5 — PrimeNG purge

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

---

## Fase 6 — Angular 22

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

---

## Fase 7 — Zoneless / OnPush

Eliminar Zone.js.

Auditar change detection.

---

## Fase 8 — Vitest

Migrar Jest.

---

## Fase 9 — Angular modern API refactor

Refactor:

```text
Weather → httpResource
Cities → httpResource
manual derived effects → computed/linkedSignal
Signal Forms donde aporte
animations legacy → CSS/native
```

---

## Fase 10 — .NET skeleton

Crear:

```text
Api
Application
Domain
Infrastructure
tests
Dockerfile
```

---

## Fase 11 — Cities

EF Core + SearchCitiesQuery.

---

## Fase 12 — Municipality import

Command idempotente.

---

## Fase 13 — AEMET infrastructure

Provider + mapper.

---

## Fase 14 — Gachas domain

Scoring + tests.

---

## Fase 15 — Weather query

Endpoint completo.

---

## Fase 16 — Resilience

Añadir:

```text
caching
rate limiting
ProblemDetails
logging
```

---

## Fase 17 — Nuevo Weather contract

Añadir:

```text
score
reasons
bestForGachas
```

---

## Fase 18 — Angular/.NET integration

Frontend apunta al backend .NET.

---

## Fase 19 — Nueva UI Weather

Renderizar explicación.

---

## Fase 20 — Contract parity

Nest vs .NET.

---

## Fase 21 — Staging

Desplegar .NET en hostname temporal.

---

## Fase 22 — Cutover

```text
api.domain
→
ASP.NET
```

---

## Fase 23 — Nest retirement

Eliminar deployment antiguo.

---

# 68. Estrategia de PRs

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

# 69. Dependencias objetivo frontend

Idealmente:

```text
Angular
Angular Router
Angular HTTP
Angular Forms / Signal Forms
Angular ARIA
Angular CDK
Tailwind
GSAP
RxJS
```

y muy poco más.

Especialmente:

```text
No PrimeNG
No PrimeUI
No generic UI framework
```

---

# 70. APIs Angular que queremos demostrar

Al terminar:

```text
standalone components
signals
computed
model/input/output
resource
httpResource
linkedSignal donde encaje
Signal Forms donde encaje
Angular ARIA
CDK Overlay
Zoneless
OnPush
modern control flow
SSR/hydration
PWA
Vitest
```

La ausencia de PrimeNG es además una ventaja aquí:

> se ve mucho mejor qué parte del comportamiento está realmente implementada con Angular.

---

# 71. Definition of Done frontend

Frontend terminado cuando:

- Angular 22;
- toolchain compatible;
- PrimeNG eliminado;
- PrimeIcons eliminado;
- Prime themes eliminados;
- tailwindcss-primeui eliminado;
- autocomplete accesible propio;
- botones nativos;
- toast propio;
- popover sin PrimeNG;
- tokens visuales propios;
- Zoneless;
- OnPush;
- Weather usa `httpResource`;
- modelo reactivo revisado;
- Vitest si no existe blocker serio;
- SSR funciona;
- PWA funciona;
- tests pasan.

---

# 72. Definition of Done backend

- ASP.NET Core en producción;
- EF Core;
- CQRS;
- Clean boundaries;
- Cities;
- municipality import;
- AEMET provider;
- domain scoring;
- caching;
- rate limiting;
- ProblemDetails;
- healthcheck;
- tests;
- Docker;
- Coolify.

---

# 73. Definition of Done producto

El usuario puede:

1. buscar municipio mediante autocomplete accesible;
2. consultar previsión;
3. saber si hace día de gachas;
4. saber por qué;
5. comparar hoy/mañana;
6. identificar el mejor de ambos días;
7. compartir el resultado.

---

# 74. Cosas que no vamos a introducir

Frontend:

```text
otra mega component library
NgRx
Redux
microfrontends
custom framework
experimental APIs porque sí
```

Backend:

```text
microservices
Kafka
RabbitMQ
Redis
event sourcing
Kubernetes
DDD ceremonial
generic repository
custom UnitOfWork
```

Producto:

```text
users
auth
social
favoritos
ML predictor de gachas
```

---

# 75. Narrativa técnica final

Al terminar, la descripción del proyecto será aproximadamente:

> Día de Gachas es una PWA construida con Angular 22 y ASP.NET Core 10 que integra AEMET para evaluar si las condiciones meteorológicas son adecuadas para comer gachas. El frontend fue modernizado desde Angular 19, eliminando su dependencia de PrimeNG en favor de Angular ARIA, CDK, HTML nativo y Tailwind; utiliza Signals, httpResource, Zoneless y OnPush. El backend fue migrado progresivamente desde NestJS/Prisma a una arquitectura modular Clean con CQRS, MediatR, EF Core/MySQL, caching, rate limiting y una integración tipada con AEMET.

Y la historia de migración:

```text
Angular 19
PrimeNG
NestJS
Prisma
    ↓
strangler migration
    ↓
Angular 22
Angular ARIA / CDK
ASP.NET Core
EF Core
```

---

# 76. Valor para entrevista

## Angular

Permite explicar:

- tres major upgrades;
- eliminación de component library;
- accesibilidad de combobox;
- Angular ARIA;
- CDK Overlay;
- Signals;
- httpResource;
- Zoneless;
- OnPush;
- testing moderno.

## .NET

Permite explicar:

- ASP.NET Core;
- CQRS;
- MediatR;
- EF Core;
- Clean Architecture;
- integration patterns;
- caching;
- testing.

## Arquitectura

Permite explicar:

- strangler migration;
- contract parity;
- schema ownership;
- reversible cutover;
- dependency reduction;
- incremental refactoring.

## Producto

Permite explicar:

- extracción de reglas implícitas a dominio;
- explicabilidad;
- mejora funcional pequeña;
- scope control.

---

# 77. Instrucciones para agentes

Este documento es la **source of truth**.

Cada agente debe:

1. leerlo;
2. identificar la fase actual;
3. inspeccionar el código real relacionado;
4. no avanzar fases por iniciativa propia;
5. preservar comportamiento salvo cambio documentado;
6. ejecutar build/tests;
7. revisar su diff;
8. documentar cualquier desviación.

Especialmente:

> ningún agente debe introducir PrimeNG/PrimeUI de nuevo.

Si necesita UI:

```text
primero HTML
luego Angular primitives
luego CDK
y solo después considerar una dependencia externa pequeña
```

---

# 78. Criterio para una dependencia frontend nueva

Antes de añadir una dependencia, responder:

1. ¿Podemos hacerlo correctamente con HTML?
2. ¿Angular proporciona una primitive?
3. ¿Angular CDK resuelve la parte compleja?
4. ¿La implementación propia sería insegura o excesivamente costosa?
5. ¿La dependencia aporta mucho más de lo que pesa?

Solo entonces añadirla.

---

# 79. Criterio de modernización

Cada refactor debe mejorar al menos una de:

```text
simplicidad
accesibilidad
tipado
testabilidad
performance
ownership
mantenibilidad
dependency footprint
```

Si la única explicación es:

> “esta API es nueva”.

No se hace.

---

# 80. Regla final

La arquitectura final debe parecer más profesional que la inicial.

La aplicación debe parecer igual de absurda.

Éxito:

> “Han migrado Angular, eliminado una UI library, construido un autocomplete accesible, migrado Nest a .NET y modelado el dominio... para saber si toca comer gachas.”

Exactamente esa energía.
