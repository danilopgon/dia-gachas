# 42 · Estado de la migración

> Registro vivo. **Este es el primer fichero que lee un agente al arrancar.**
> Índice general en [`../README.md`](../README.md).

---

## Cómo funciona el seguimiento

Hay dos fuentes de verdad y **no son la misma cosa**:

| | Qué es | Quién lo escribe | Puede mentir |
|---|---|---|---|
| **DETECTADO** | Se deriva del repositorio (versión de Angular, existencia de `GachasScoringPolicy`, ausencia de `p-button`…) | Nadie: se calcula | No |
| **DECLARADO** | La tabla de abajo | Humanos y agentes al cerrar una fase | Sí |

Un fichero de estado que hay que actualizar a mano **siempre acaba mintiendo**.
Por eso el estado real se calcula desde el código:

```bash
./scripts/migration-status.sh
```

El script imprime ambas columnas y avisa cuando no coinciden. Si hay discrepancia,
**gana DETECTADO** y hay que corregir esta tabla.

La tabla de abajo existe para lo que el repo no puede saber: cuándo se hizo, en qué
PR, y qué se decidió por el camino.

Tres fases no son derivables del repositorio (marcadas ✋ por el script) porque
viven en infraestructura, no en el código: **18** (a qué API apunta el deploy),
**21** (staging) y **22** (cutover de DNS). Esas se declaran a mano aquí, y punto.

---

## Estado por fase

Estados: `⬜` pendiente · `🔄` en curso · `✅` hecha · `⏭️` omitida (justifícala en Notas)

| Fase | Estado | PR | Fecha | Notas |
|---|---|---|---|---|
| 00 | ⬜ | — | — | Baseline: build, tests y respuestas de API antes de tocar nada + tag `baseline/pre-migracion` |
| 01 | ⬜ | — | — | Angular 20 |
| 02 | ⬜ | — | — | Angular 21 |
| 03 | ⬜ | — | — | Botones, iconos, float label, popover, toast, theme |
| 04 | ⬜ | — | — | CityAutocomplete accesible |
| 05 | ⬜ | — | — | PrimeNG = 0 |
| 06 | ⬜ | — | — | Angular 22 |
| 07 | ⬜ | — | — | Zoneless + OnPush |
| 08 | ⬜ | — | — | Jest → Vitest |
| 09 | ⬜ | — | — | httpResource / signals cleanup |
| 10 | ⬜ | — | — | Esqueleto .NET |
| 11 | ⬜ | — | — | Cities (EF Core + SearchCitiesQuery) |
| 12 | ⬜ | — | — | Import idempotente de municipios |
| 13 | ⬜ | — | — | Provider + mapper AEMET |
| 14 | ⬜ | — | — | Dominio de gachas + scoring |
| 15 | ⬜ | — | — | Weather query completa |
| 16 | ⬜ | — | — | Cache, rate limiting, ProblemDetails, logging |
| 17 | ⬜ | — | — | score / reasons / bestForGachas |
| 18 | ⬜ | — | — | ✋ Frontend apunta al backend .NET |
| 19 | ⬜ | — | — | UI de la explicación del veredicto |
| 20 | ⬜ | — | — | Contract parity Nest vs .NET |
| 21 | ⬜ | — | — | ✋ .NET en hostname temporal |
| 22 | ⬜ | — | — | ✋ Cutover de `api.domain` |
| 23 | ⬜ | — | — | Retirada del deployment Nest |

---

## Protocolo al abrir y cerrar una fase

**Al abrir:**

1. `./scripts/migration-status.sh` → confirma que la fase que vas a hacer es la actual.
2. Marca la fila como `🔄` en esta tabla, en el primer commit del PR.
3. Carga solo los documentos que esa fase referencia en [`40-fases.md`](./40-fases.md).

**Al cerrar:**

1. `lint` + `test` + `build` verdes.
2. Vuelve a correr el script: la columna DETECTADO debe pasar a `✅` sola.
   Si no pasa, **la fase no está hecha**, digan lo que digan tus buenas intenciones.
3. Marca `✅` en esta tabla con el número de PR y la fecha.
4. Si te has desviado del plan, anótalo en [`43-bitacora.md`](./43-bitacora.md)
   y actualiza el documento de `docs/` afectado.

> No marques `✅` una fase que el script no detecta como hecha, salvo las tres
> fases ✋. Si haces eso, el siguiente agente arranca sobre una mentira y el
> sistema entero deja de servir.

---

## Documentos relacionados

- Qué hace cada fase: [`40-fases.md`](./40-fases.md)
- Troceado en PRs: [`41-estrategia-prs.md`](./41-estrategia-prs.md)
- Bitácora de decisiones y desviaciones: [`43-bitacora.md`](./43-bitacora.md)
- Reglas de comportamiento del agente: [`../agents/50-instrucciones-generales.md`](../agents/50-instrucciones-generales.md)
