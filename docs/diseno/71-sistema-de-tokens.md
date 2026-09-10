# 71 · Sistema de tokens

> Fuente: Dirección de diseño §D7–§D10, §D13, §D14. Índice general en [`../README.md`](../README.md).
>
> **Estos tokens sustituyen a la lista provisional de §16** en
> [`../frontend/13-theming.md`](../frontend/13-theming.md). La intención de §16
> (pocos tokens, propios, integrados con Tailwind, sin theme PrimeNG) se mantiene:
> lo que cambia son los nombres y los valores concretos.

---

## §D7 · Paleta

La app es **light-first**.

```text
Light-first.
No se requiere tema oscuro para la migración.
Una futura interpretación en oscuro está fuera de alcance, no prohibida.
```

El sistema está construido sobre papel y tinta, así que el modo claro es su estado
natural. Eso no convierte "nada de dark mode" en una regla fundamental.

### Primitives

```css
:root {
  /* Neutrals */
  --color-paper-50:  #f8f4ea;
  --color-paper-100: #f1eadc;
  --color-paper-200: #e6dcc8;

  --color-ink-700:   #403c34;
  --color-ink-800:   #2c2924;
  --color-ink-900:   #1c1a17;

  /* Paprika */
  --color-red-300:   #d9785c;
  --color-red-500:   #b84830;
  --color-red-700:   #84301f;

  /* Weather cold */
  --color-blue-300:  #91a8b8;
  --color-blue-500:  #5f7888;
  --color-blue-700:  #3f5664;

  /* Earth */
  --color-earth-300: #b29b72;
  --color-earth-500: #876d45;
  --color-earth-700: #5f4a2e;

  /* Supporting */
  --color-green-500: #667556;
  --color-amber-500: #c2883c;
}
```

Los nombres de primitives describen el color, no su intención.

### Semantic tokens

```css
:root {
  --surface-page: var(--color-paper-50);
  --surface-raised: var(--color-paper-100);
  --surface-sunken: var(--color-paper-200);

  --text-primary: var(--color-ink-900);
  --text-secondary: var(--color-ink-700);
  --text-inverse: var(--color-paper-50);

  --border-default: var(--color-ink-900);
  --border-muted: color-mix(
    in srgb,
    var(--color-ink-900) 35%,
    transparent
  );

  --accent-primary: var(--color-red-500);
  --accent-primary-hover: var(--color-red-700);

  --weather-cold: var(--color-blue-500);
  --weather-warm: var(--color-earth-500);

  --state-good: var(--color-green-500);
  --state-warning: var(--color-amber-500);
  --state-bad: var(--color-red-500);
}
```

### Tokens del dominio

El diseño puede nombrar explícitamente conceptos del producto.

```css
:root {
  --gacha-poor: var(--color-earth-300);
  --gacha-maybe: var(--color-amber-500);
  --gacha-good: var(--color-red-500);
  --gacha-glorious: var(--color-red-700);
}
```

Esto es preferible a convertir Día de Gachas en un sistema abstracto de `success/info/warning` típico de dashboard.

**Un veredicto positivo de gachas usa pimentón, no el verde genérico de dashboard.**
`--color-green-500` existe como color de apoyo, no como "esto ha ido bien".

---

## §D8 · Tipografía

La tipografía tiene tres funciones, no tres estilos decorativos.

```css
:root {
  --font-display: "UnifrakturCook", serif;
  --font-body: "Newsreader", serif;
  --font-data: "IBM Plex Mono", monospace;
}
```

### Display — UnifrakturCook

- marca;
- identidad Día de Gachas;
- veredictos importantes;
- titulares expresivos concretos.

Usar **con moderación** y a gran escala. **Nunca para lectura larga.**

### Texto — Newsreader

- titulares editoriales;
- cuerpo y contenido;
- copy explicativo.

Es la tipografía más legible de la interfaz y la que hace el trabajo pesado.

### Datos — IBM Plex Mono

- datos meteorológicos;
- etiquetas;
- fechas;
- score;
- información instrumental / de estación.

El contraste `display artesanal + dato mono` es una de las claves de la dirección **future medieval**.

> **PPWoodland y Alegreya Sans no son tipografías objetivo.** Son las actuales de
> `dev` y se retiran durante la migración. Ver
> [`../01-estado-actual.md`](../01-estado-actual.md).
>
> Si UnifrakturCook se reconsidera en el futuro, eso es una decisión de diseño
> aparte: no se sustituye en silencio por otra tipografía medieval.

### Escala

```css
:root {
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
  --text-2xl: 2rem;

  --text-display-sm: clamp(2.5rem, 7vw, 4rem);
  --text-display-md: clamp(3.5rem, 10vw, 6rem);
  --text-display-xl: clamp(4.5rem, 15vw, 9rem);

  --leading-tight: 0.95;
  --leading-heading: 1.05;
  --leading-body: 1.5;

  --tracking-tight: -0.03em;
  --tracking-wide: 0.08em;
  --tracking-data: 0.12em;
}
```

---

## §D9 · Espaciado y layout

Mantener una escala pequeña y predecible.

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4rem;
  --space-9: 6rem;
  --space-10: 8rem;

  --layout-gutter: clamp(1rem, 4vw, 3rem);
  --layout-section-gap: clamp(4rem, 9vw, 8rem);
  --layout-content-max: 72rem;
  --layout-reading-max: 42rem;
}
```

La composición debe recordar más a una portada o página editorial que a una colección de widgets.

---

## §D10 · Bordes, radios y sombras

### Bordes

```css
:root {
  --rule-thin: 1px solid var(--border-default);
  --rule-medium: 2px solid var(--border-default);
  --rule-heavy: 4px solid var(--border-default);
  --rule-double: 3px double var(--border-default);
}
```

Las reglas editoriales son parte del lenguaje visual.

### Radios

```css
:root {
  --radius-none: 0;
  --radius-sm: 2px;
  --radius-md: 4px;
}
```

No introducir radios grandes salvo que un componente tenga una justificación concreta.

### Sombras

```css
:root {
  --shadow-none: none;
  --shadow-hard-sm: 3px 3px 0 var(--color-ink-900);
  --shadow-hard-md: 6px 6px 0 var(--color-ink-900);
}
```

Las sombras, cuando existan, deben recordar a:

- impresión desplazada;
- papel superpuesto;
- offset.

No a una card flotando sobre un fondo SaaS.

---

## §D13 · Design system: arquitectura

No crear un design system empresarial.

No introducir cientos de variables.

No construir abstractions “por si acaso”.

La arquitectura recomendada es:

```text
frontend/src/styles/
├── tokens.css
├── base.css
└── utilities.css
```

Y estilos de componente cerca de su componente cuando tengan sentido.

### Capas

```text
PRIMITIVE
    ↓
SEMANTIC
    ↓
COMPONENT
```

#### Primitive

Describe valores.

```text
--color-paper-50
--color-ink-900
--color-red-500
--space-4
```

#### Semantic

Describe intención.

```text
--surface-page
--text-primary
--accent-primary
--weather-cold
```

#### Component

Solo cuando un componente propio necesite contrato visual estable.

Botón:

```css
:root {
  --button-bg: var(--text-primary);
  --button-text: var(--text-inverse);
  --button-border: var(--text-primary);

  --button-bg-hover: var(--accent-primary);
  --button-radius: var(--radius-sm);

  --button-padding-x: var(--space-5);
  --button-padding-y: var(--space-3);
}
```

Bloque meteorológico editorial:

```css
:root {
  --forecast-bg: transparent;
  --forecast-border: var(--rule-heavy);
  --forecast-label-font: var(--font-data);
  --forecast-value-font: var(--font-body);
}
```

Gachómetro:

```css
:root {
  --gachometer-track: var(--color-ink-900);
  --gachometer-marker: var(--accent-primary);

  --gachometer-height: 2px;
  --gachometer-tick-height: 12px;
  --gachometer-marker-size: 18px;
}
```

Estos son ejemplos de **contratos visuales de componentes del dominio**, no una
invitación a construir una librería de UI de propósito general.

No duplicar un token semántico únicamente para “seguir la arquitectura”.

---

## §D14 · Tailwind CSS v4

Mantener Tailwind como herramienta de composición.

Los tokens son la fuente de verdad.

Cuando aporte ergonomía, exponerlos mediante `@theme`.

Ejemplo:

```css
@theme {
  --color-paper: var(--surface-page);
  --color-ink: var(--text-primary);
  --color-paprika: var(--accent-primary);
}
```

Los primitives (`--color-paper-50`, `--color-red-500`…) viven en `tokens.css` bajo
`:root`. Solo lo que se declara dentro de `@theme` genera utilidades de Tailwind, así
que exponer un alias corto ahí no colisiona con el primitive del que sale.

Evitar que el markup vuelva a llenarse de hexadecimales o decisiones visuales arbitrarias.

Preferir:

```html
<h1 class="text-ink">
```

frente a:

```html
<h1 class="text-[#1c1a17]">
```

La retirada de PrimeNG incluye la eliminación de tokens conceptuales como `text-surface-50`.

---

## Documentos relacionados

- Retirada del theme PrimeNG y de `text-surface-*`: [`../frontend/13-theming.md`](../frontend/13-theming.md)
- Tokens de ilustración: [`73-marginalia-e-ilustracion.md`](./73-marginalia-e-ilustracion.md)
- Tokens de movimiento: [`74-movimiento.md`](./74-movimiento.md)
- Component tokens del Gachómetro: [`75-pantallas.md`](./75-pantallas.md) §D18
- Fase D1 (Foundation): [`77-implantacion.md`](./77-implantacion.md)
