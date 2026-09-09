# 13 · Theming y tokens visuales

> Fuente: BRS §16, §17. Índice general en [`../README.md`](../README.md).

---

## 16. Theming

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

## 17. Tokens PrimeNG existentes

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

## Documentos relacionados

- Punto de salida de PrimeNG (definición de "terminado"): [`11-primeng-decision.md`](./11-primeng-decision.md) §19
- Fase 5 — PrimeNG purge: [`../plan/40-fases.md`](../plan/40-fases.md)
