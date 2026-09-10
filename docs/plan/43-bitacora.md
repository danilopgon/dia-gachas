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
