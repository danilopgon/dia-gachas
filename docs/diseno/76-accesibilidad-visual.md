# 76 · Accesibilidad de la dirección visual

> Fuente: Dirección de diseño §D22. Índice general en [`../README.md`](../README.md).
>
> Complementa a §62 en [`../frontend/17-testing-frontend.md`](../frontend/17-testing-frontend.md),
> que cubre la accesibilidad **funcional** (combobox, listbox, foco, anuncios).
> Aquí se cubre la que puede romper una dirección de arte.

---

## §D22 · Accesibilidad

La dirección artística nunca puede esconder información.

Mantener como mínimo:

- WCAG AA;
- contrastes suficientes;
- navegación por teclado;
- foco visible;
- labels persistentes cuando sean necesarias;
- `aria-live` en feedback async;
- soporte para reduced motion;
- texto equivalente para indicadores visuales;
- targets táctiles adecuados.

### Marginalia

Por defecto:

```html
aria-hidden="true"
```

salvo que transmita información no disponible en texto.

Nunca introducir ruido a lectores de pantalla por pura decoración.

---

## Documentos relacionados

- Tests de accesibilidad funcional: [`../frontend/17-testing-frontend.md`](../frontend/17-testing-frontend.md) §62
- El Gachómetro no puede depender solo de color: [`75-pantallas.md`](./75-pantallas.md) §D18
- Reduced motion: [`74-movimiento.md`](./74-movimiento.md) §D12
- Marginalia decorativa: [`73-marginalia-e-ilustracion.md`](./73-marginalia-e-ilustracion.md) §D11
