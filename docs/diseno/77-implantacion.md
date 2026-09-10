# 77 · Implantación y Definition of Done visual

> Fuente: Dirección de diseño §D24, §D25. Índice general en [`../README.md`](../README.md).

---

## Las fases D **no son un track paralelo**

Esto es importante y va primero, porque es la trampa obvia:

> Las fases D1–D7 **no** son una migración aparte con su propio calendario.
> Son el contenido visual de fases que ya existen en
> [`../plan/40-fases.md`](../plan/40-fases.md).

Si se convierten en un segundo roadmap, acabamos con dos verdades sobre dónde
estamos, que es justo lo que el seguimiento de
[`../plan/42-estado.md`](../plan/42-estado.md) evita.

| Fase D | Se hace dentro de | Por qué ahí |
|---|---|---|
| **D1** Foundation | **Fase 3** (bloque `theme`) | Los tokens sustituyen al theme PrimeNG. Se puede preparar desde la Fase 2 |
| **D2** Primitives | **Fases 3 y 4** | Es literalmente la sustitución componente a componente |
| **D3** Home | **Fase 4** | La home se recompone al construir el autocomplete propio |
| **D4** Result | **Fase 19** | Necesita `score`, `reasons` y `bestForGachas`, que llegan en la Fase 17 |
| **D5** Marginalia | **Fase 19** o posterior | No depende del backend; puede ir después sin bloquear nada |
| **D6** Motion & polish | **Fase 9** + pasada final tras la 19 | La Fase 9 ya retira animación legacy |
| **D7** Documentation cleanup | Continuo | No es una fase: se hace al cerrar cada una |

El estado sigue leyéndose con `./scripts/migration-status.sh`. No hay columnas D.

---

## §D24 · Plan de implantación dentro de la migración

El rediseño debe acoplarse a la retirada de PrimeNG, no convertirse en una migración paralela infinita.

### Fase D1 — Foundation

- crear `tokens.css`;
- mover fuentes y estilos base a una estructura clara;
- definir superficie `paper`;
- definir tinta y pimentón;
- integrar tokens con Tailwind v4;
- eliminar dependencias visuales de `text-surface-*`;
- mantener comportamiento actual.

### Fase D2 — Primitives

Durante la retirada de PrimeNG:

- botón → `GachasButton` / HTML nativo;
- float label → label/input propio;
- toast → ToastService propio;
- autocomplete → `CityAutocomplete` accesible;
- iconos PrimeIcons → iconografía propia o SVG mínimos.

No recrear visualmente PrimeNG.

### Fase D3 — Home

- retirar dependencia del paisaje full-screen;
- implantar layout editorial;
- rediseñar autocomplete;
- introducir primeras reglas y marginalia;
- conservar el flujo funcional.

### Fase D4 — Result

- implantar veredicto protagonista;
- crear Gachómetro;
- estructurar “Los augurios”;
- integrar `score`, `reasons` y `bestDay`;
- rediseñar share.

### Fase D5 — Marginalia

- preparar set inicial con Dither Boy;
- añadir variantes de lluvia/viento/frío/calor;
- revisar peso de assets;
- comprobar que la UI funciona también sin ellos.

### Fase D6 — Motion & polish

- revisar GSAP existente;
- eliminar animación gratuita;
- introducir motion tokens;
- comprobar reduced motion;
- hacer pasada final mobile/desktop.

### Fase D7 — Documentation cleanup

Actualizar:

```text
frontend/.impeccable.md
docs/frontend/13-theming.md
docs/frontend/16-ui-veredicto-y-share.md
docs/README.md
```

para que no existan dos direcciones visuales contradictorias.

> **Estado de D7:** `docs/frontend/13-theming.md`, `docs/frontend/16-ui-veredicto-y-share.md`
> y `docs/README.md` ya llevan la anotación de precedencia desde que se incorporó
> esta dirección. `frontend/.impeccable.md` lleva una cabecera que cede la
> dirección visual a estos documentos, pero **su contenido visual sigue sin
> reescribirse**: eso se cierra al terminar D4.

---

## §D25 · Definition of Done visual

La nueva dirección se considera implantada cuando:

- PrimeNG no controla ningún aspecto visual;
- no quedan tokens `surface-*` heredados de PrimeNG;
- home y result utilizan el mismo sistema de tokens;
- no hay colores hex arbitrarios repartidos por templates;
- el layout no depende de cards genéricas;
- el Gachómetro representa visualmente el score;
- `score`, `reasons` y `bestDay` tienen jerarquía clara;
- existe al menos un set coherente de marginalia propia;
- la marginalia funciona como decoración accesible;
- la home funciona sin fondo ilustrado full-screen;
- resultado mobile es compartible/capturable con buena composición;
- `prefers-reduced-motion` funciona;
- contraste y teclado cumplen el mínimo de accesibilidad definido por el proyecto;
- visualmente la app no se confunde con una app meteorológica genérica ni con una landing SaaS.

---

## Documentos relacionados

- Fases 0–23 de la migración: [`../plan/40-fases.md`](../plan/40-fases.md)
- Estado y protocolo de fase: [`../plan/42-estado.md`](../plan/42-estado.md)
- Definition of Done funcional del frontend: [`../agents/53-definition-of-done.md`](../agents/53-definition-of-done.md) §71
