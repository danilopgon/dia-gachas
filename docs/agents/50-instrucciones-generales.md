# 50 · Instrucciones generales para agentes

> Fuente: BRS §77. Índice general en [`../README.md`](../README.md).

---

## 77. Instrucciones para agentes

El conjunto de documentos de `docs/` (indexado desde `AGENTS.md`) es la
**source of truth**.

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

## Cómo aplicar esto en la práctica

**Antes de tocar código:**

- Localiza la fase en [`../plan/40-fases.md`](../plan/40-fases.md).
- Carga solo los documentos de `docs/` que esa fase referencia. No cargues todo.
- Lee el código real; el documento describe el objetivo, no el estado presente.

**Mientras trabajas:**

- No mezcles fases en un mismo cambio (ver [`../plan/41-estrategia-prs.md`](../plan/41-estrategia-prs.md)).
- No mezcles migración de test runner con migración de componentes.
- Cambio de comportamiento sin documentar = bug.

**Antes de cerrar:**

```bash
npm run lint:web && npm run test:web && npm run build:web   # frontend
npm run lint:api && npm run test:api && npm run build:api   # backend Nest (mientras exista)
```

- Revisa tu propio diff línea a línea.
- Si te has desviado del plan, documenta la desviación en el PR **y** actualiza
  el documento de `docs/` correspondiente. Los documentos son vivos; el BRS
  congelado de `docs/archivo/` no se toca.

---

## Documentos relacionados

- Criterio para añadir dependencias: [`51-criterio-dependencias.md`](./51-criterio-dependencias.md)
- Criterio de modernización: [`52-criterio-modernizacion.md`](./52-criterio-modernizacion.md)
- Definition of Done: [`53-definition-of-done.md`](./53-definition-of-done.md)
