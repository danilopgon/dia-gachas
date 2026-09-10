# 71 · Sistema de tokens

> Fuente: Dirección de diseño §D7–§D10, §D13, §D14. Índice general en [`../README.md`](../README.md).
>
> **Estos tokens sustituyen a la lista provisional de §16** en
> [`../frontend/13-theming.md`](../frontend/13-theming.md). La intención de §16
> (pocos tokens, propios, integrados con Tailwind, sin theme PrimeNG) se mantiene:
> lo que cambia son los nombres y los valores concretos.

---

## §D7 · Paleta

La app permanece **light-first / light-only** salvo que exista una razón de producto para introducir otro tema.

### Primitives

```css
:root {
  /* Paper */
  --paper-50:  #f8f4ea;
  --paper-100: #f1eadc;
  --paper-200: #e5d9c3;

  /* Ink */
  --ink-700: #4a453d;
  --ink-800: #302d28;
  --ink-900: #1c1a17;

  /* Paprika */
  --paprika-300: #d9785c;
  --paprika-500: #b84830;
  --paprika-700: #84301f;

  /* Weather */
  --sky-300: #9aabb2;
  --sky-500: #657d87;
  --sky-700: #415861;

  /* Earth */
  --earth-300: #baa47c;
  --earth-500: #8a6d45;
  --earth-700: #5d482e;

  /* Supporting states */
  --olive-500: #69745a;
  --amber-500: #bd8237;
}
```

Los nombres de primitives describen el color, no su intención.

### Semantic tokens

```css
:root {
  --surface-page: var(--paper-50);
  --surface-subtle: var(--paper-100);
  --surface-strong: var(--ink-900);

  --text-primary: var(--ink-900);
  --text-secondary: var(--ink-700);
  --text-inverse: var(--paper-50);

  --border-default: var(--ink-900);
  --border-muted: color-mix(in srgb, var(--ink-900) 30%, transparent);

  --accent-primary: var(--paprika-500);
  --accent-primary-hover: var(--paprika-700);

  --weather-accent: var(--sky-500);

  --state-positive: var(--olive-500);
  --state-warning: var(--amber-500);
  --state-negative: var(--paprika-500);
}
```

### Tokens del dominio

El diseño puede nombrar explícitamente conceptos del producto.

```css
:root {
  --gacha-poor: var(--earth-300);
  --gacha-maybe: var(--amber-500);
  --gacha-good: var(--paprika-500);
  --gacha-glorious: var(--paprika-700);
}
```

Esto es preferible a convertir Día de Gachas en un sistema abstracto de `success/info/warning` típico de dashboard.

El estado “perfecto para gachas” **no tiene por qué ser verde**. El rojo pimentón es más propio del producto.

---

## §D8 · Tipografía

La tipografía tiene tres funciones, no tres estilos decorativos.

### Display

```css
--font-display: "PPWoodland", serif;
```

Uso:

- marca;
- veredicto;
- titulares principales;
- cifras realmente protagonistas.

Debe utilizarse a gran escala y con moderación.

### Texto

```css
--font-body: "Alegreya", sans-serif;
```

Uso:

- instrucciones;
- copy;
- resultados secundarios;
- mensajes;
- acciones.

### Datos

No es obligatorio introducir un tercer asset tipográfico.

```css
--font-data: ui-monospace, "SFMono-Regular", Consolas, monospace;
```

Uso:

- temperatura;
- porcentaje;
- viento;
- fecha;
- etiquetas técnicas;
- score.

El contraste `display artesanal + dato mono` es una de las claves de la dirección **future medieval**.

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
  --shadow-hard-sm: 3px 3px 0 var(--ink-900);
  --shadow-hard-md: 6px 6px 0 var(--ink-900);
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
--paper-50
--ink-900
--paprika-500
--space-4
```

#### Semantic

Describe intención.

```text
--surface-page
--text-primary
--accent-primary
--weather-accent
```

#### Component

Solo cuando un componente propio necesite contrato visual estable.

```text
--gachometer-marker
--verdict-border
--search-control-height
```

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
