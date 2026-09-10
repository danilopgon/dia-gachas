# 74 · Movimiento

> Fuente: Dirección de diseño §D12. Índice general en [`../README.md`](../README.md).
>
> Complementa —no sustituye— a §32 en
> [`../frontend/15-reactividad-signals.md`](../frontend/15-reactividad-signals.md):
> aquella decide **qué tecnología** (GSAP para lo complejo, CSS para lo pequeño,
> nada de `@angular/animations`); esta decide **cómo se siente**.

---

## §D12 · Movimiento

El movimiento debe ayudar a crear carácter, no demostrar que tenemos GSAP.

### Tokens

```css
:root {
  --motion-fast: 100ms;
  --motion-normal: 180ms;
  --motion-slow: 320ms;

  --ease-snap: cubic-bezier(0.2, 0, 0, 1);
}
```

### UI

Los controles deben sentirse físicos y rápidos.

Ejemplo:

```css
.action:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-sm);
}
```

La sensación es:

> thunk

No:

> floating premium component ✨

### Ambientación

GSAP puede seguir utilizándose para:

- revelar una estampa;
- pequeños parallax;
- desplazamiento ambiental puntual;
- entrada del veredicto;
- detalles de marginalia.

No utilizar loops de movimiento en todos los elementos.

`prefers-reduced-motion` sigue siendo obligatorio.

---

## Documentos relacionados

- Qué tecnología de animación se usa: [`../frontend/15-reactividad-signals.md`](../frontend/15-reactividad-signals.md) §32
- Tokens de sombra usados en el hover físico: [`71-sistema-de-tokens.md`](./71-sistema-de-tokens.md) §D10
- Reduced motion como requisito: [`76-accesibilidad-visual.md`](./76-accesibilidad-visual.md) §D22
- Fase D6 (Motion & polish): [`77-implantacion.md`](./77-implantacion.md)
