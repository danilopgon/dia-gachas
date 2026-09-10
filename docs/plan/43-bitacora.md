# 43 · Bitácora de decisiones y desviaciones

> Índice general en [`../README.md`](../README.md).
>
> [`../agents/50-instrucciones-generales.md`](../agents/50-instrucciones-generales.md)
> (§77, punto 8) obliga a documentar cualquier desviación del plan. Este es el sitio.

---

## Para qué sirve

El plan de `docs/` dice lo que **queremos**. La realidad a veces dice otra cosa:
un peer dependency imposible, una API que no existe todavía, una regla de negocio
que estaba mal desde el principio.

Cuando eso pase:

- **no** cambies el plan en silencio;
- **no** te lo comas y sigas;
- anótalo aquí, actualiza el documento de `docs/` afectado, y sigue.

Una entrada aquí es una decisión, no una queja. Si es solo "esto me costó",
va en la descripción del PR, no aquí.

---

## Formato

```markdown
## AAAA-MM-DD · Fase NN · Título corto

**Contexto:** qué estaba pasando.
**Decisión:** qué se hizo.
**Alternativas descartadas:** y por qué.
**Impacto en el plan:** qué documento de `docs/` cambia (o "ninguno").
```

Añade las entradas **al final**, en orden cronológico. No se editan entradas
antiguas: si una decisión se revierte, se escribe una nueva que lo diga.

---

## Entradas

## 2026-09-09 · Fase — · Documentación troceada y rama `dev`

**Contexto:** el plan de migración vivía en un único documento de ~2300 líneas.
Inviable de cargar en contexto por fase, e invitaba a que cada agente se leyera
todo (o nada).

**Decisión:** trocearlo en `docs/` por temática, con `AGENTS.md` como router y
`CLAUDE.md` apuntando a él. El original queda congelado en `docs/archivo/` solo
para trazabilidad. Rama `dev` como base de toda la migración.

**Alternativas descartadas:** mantener el documento único (no escala en contexto);
borrar el original (se pierde trazabilidad frente al BRS acordado).

**Impacto en el plan:** ninguno en contenido. Las 80 secciones conservan su
numeración original para poder citarlas en PRs.

---

## 2026-09-09 · Fase — · Estado derivado del repositorio, no declarado

**Contexto:** hacía falta que un agente supiera en qué punto de la migración
está al arrancar. La opción obvia era un fichero de estado mantenido a mano.

**Decisión:** el estado real se **calcula** desde el repositorio con
`scripts/migration-status.sh` (versión de Angular, ausencia de PrimeNG,
existencia de tipos .NET, etc.). `42-estado.md` se mantiene como registro de
PR/fecha/notas, y el script avisa cuando ambas fuentes no coinciden.

**Alternativas descartadas:** solo fichero manual (se desincroniza y nadie se
entera); GitHub Projects (estado fuera del repo, un agente no lo ve en el clon);
un roadmap paralelo troceado (duplicaría `40-fases.md`).

**Impacto en el plan:** `docs/plan/40-fases.md` gana una señal de verificación
por fase; `AGENTS.md` cambia el paso 1 del flujo de trabajo.

---

## 2026-09-09 · Fase — · Los `§` se prefijan para no parecer numeración rota

**Contexto:** al trocear el BRS, cada sección conservó su número como encabezado
(`## 74. Cosas que no vamos a introducir`). Dentro de un documento eso se lee como
numeración rota (`1`, `2`, `74`), y además colisiona con los números de fichero:
`40-fases.md` y `§40 SearchCities` compartían símbolo sin compartir significado.

**Decisión:** los encabezados de sección pasan a `## §74 · Título`. El `§` marca
que es una **cita al BRS**, no un ordinal del documento, y desambigua frente a los
números de fichero. La distinción queda explicada en `docs/README.md` y `AGENTS.md`.

**Alternativas descartadas:** renumerar las secciones de forma correlativa dentro
de cada documento (se pierde la trazabilidad con el BRS y las citas `§N` de PRs
antiguos dejan de resolver); renumerar los ficheros con prefijo de área (`b20-`,
`f10-`) para evitar la colisión (mucho churn y rompe todos los enlaces, cuando el
`§` ya resuelve la ambigüedad).

**Impacto en el plan:** ninguno en contenido. Las 80 secciones siguen presentes,
únicas y citables como `§N`.

---

## 2026-09-10 · Fase — · Se incorpora la dirección de diseño Future Medieval Manchego

**Contexto:** llegó una dirección de arte completa (27 secciones) que redefine el
frontend visualmente. Chocaba en dos puntos con el BRS ya troceado, y traía siete
fases propias (D1–D7) que amenazaban con convertirse en un segundo roadmap.

**Decisión:**

1. Troceada en `docs/diseno/` (9 documentos, 70–78), citable como `§D1`–`§D27`.
   Prefijo `§D` para no colisionar con los `§` del BRS ni con los números de fichero.
2. Los dos conflictos se resuelven **anotando, no borrando**:
   - **§53** "mantener estética actual" queda superado en lo visual por **§D17**;
     lo funcional de §53 (qué información se muestra, no ampliar alcance) sigue vigente.
   - **§16** (lista `--color-gachas-*`) queda sustituida por **§D7**; la intención de
     §16 (pocos tokens, propios, sin PrimeNG) es lo que sobrevive.
3. **Las fases D no son un track paralelo.** Se mapean sobre las fases 0–23 existentes
   (D1→3, D2→3 y 4, D3→4, D4→19, D5→19+, D6→9, D7 continuo). El seguimiento sigue
   siendo `scripts/migration-status.sh`, sin columnas D.
4. `frontend/.impeccable.md` recibe una cabecera que cede la dirección visual a
   `docs/diseno/`. No se reescribe todavía: eso es trabajo de D4/D7.

**Alternativas descartadas:** meter el documento entero de una pieza (1175 líneas,
rompe el principio de troceado); borrar §53 y §16 en lugar de anotarlos (se pierde
la trazabilidad con el BRS y el porqué del cambio); crear un seguimiento D paralelo
en `42-estado.md` (dos verdades sobre dónde estamos, justo lo que evitamos).

**Impacto en el plan:** `01-estado-actual.md` documenta ahora el punto de partida
visual real (7 usos de `text-surface-*`, 5 hex sueltos, 2 fondos full-bleed);
`40-fases.md` engancha las fases D donde tocan; el DoD del frontend (§71) queda
explícitamente incompleto sin el DoD visual (§D25).

**Pendiente de decisión humana:** PPWoodland es una tipografía comercial y §D5 la
conserva "mientras su licencia y asset actual sigan siendo válidos". Conviene
confirmar la licencia antes de que la marca dependa de ella.

---

## 2026-09-10 · Fase — · Corrección de la dirección de diseño generada

**Contexto:** el documento de dirección de diseño incorporado el día anterior era una
versión **generada** que arrastraba decisiones del `dev` actual en lugar de reflejar
la dirección acordada. No era una diferencia de matiz: la tipografía objetivo, la
paleta y el estatus de las ilustraciones estaban mal.

**Decisión:** corregir la documentación contra la dirección acordada, sin
reinterpretarla ni explorar alternativas.

| Punto | Decía | Dice ahora |
|---|---|---|
| Tipografía | PPWoodland + Alegreya Sans | **UnifrakturCook + Newsreader + IBM Plex Mono** |
| Primitives | `--paper-*`, `--ink-*`, `--paprika-*`, `--sky-*`, `--olive-*` | `--color-paper-*`, `--color-ink-*`, `--color-red-*`, `--color-blue-*`, `--color-green-*` con los valores acordados |
| Semánticos | `--surface-subtle/strong`, `--weather-accent`, `--state-positive/negative` | `--surface-raised/sunken`, `--weather-cold/warm`, `--state-good/bad`; `--border-muted` al 35 % |
| Ilustraciones | se conservan como material de marca | reutilización **opcional**, nunca una restricción de diseño |
| Tema | light-only | **light-first**: sin tema oscuro en la migración, no prohibido a futuro |
| Dither | `--illustration-primary`, `--marginalia-*` en rem, fondo 0.14 | `--illustration-color`, `--dither-size-*` en px, fondo 0.16 |
| Movimiento | `--motion-fast/normal/slow` | `--duration-fast/normal/slow` |
| Textura de papel | no estaba | regla explícita: 2–4 %, se siente más que se ve |
| Component tokens | solo ejemplos sueltos | botón, bloque meteorológico y Gachómetro completos |

**Alternativas descartadas:** conservar PPWoodland/Alegreya "porque ya están en el
repo" (es exactamente el sesgo que produjo el error); elegir otra tipografía medieval
distinta de UnifrakturCook por criterio propio (sería una decisión de diseño nueva, y
debe tomarse aparte si algún día se reconsidera).

**Impacto en el plan:** `01-estado-actual.md` deja claro qué es estado actual a
retirar y qué es destino; `13-theming.md` apunta a los nombres correctos;
`frontend/.impeccable.md` enumera qué deja de ser dirección objetivo; `docs/README.md`
añade una tabla actual → objetivo; la fase D1 incluye cargar las tipografías nuevas.
El archivo congelado lleva una cabecera que enumera lo que estaba mal, para que nadie
lo lea como referencia de implementación.

**Queda resuelto:** el aviso sobre la licencia comercial de PPWoodland deja de
aplicar como riesgo de marca — no es tipografía objetivo. UnifrakturCook, Newsreader
e IBM Plex Mono son tipografías libres; conviene igualmente autoalojarlas en vez de
depender de un CDN externo, por SSR y privacidad.
