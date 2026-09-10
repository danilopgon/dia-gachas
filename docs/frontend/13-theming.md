# 13 · Theming y tokens visuales

> Fuente: BRS §16, §17. Índice general en [`../README.md`](../README.md).
>
> ⚠️ **La lista de tokens de §16 es provisional y queda sustituida** por el sistema
> completo de [`../diseno/71-sistema-de-tokens.md`](../diseno/71-sistema-de-tokens.md).
> La *intención* de §16 no cambia (pocos tokens, propios, integrados con Tailwind,
> cero theme PrimeNG); cambian los nombres y los valores. §17 sigue vigente tal cual.

---

## §16 · Theming

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

> **Sustituido.** Estos nombres eran un esbozo previo a que existiera dirección de
> arte. El set real —`--color-paper-*`, `--color-ink-*`, `--color-red-*`, tokens
> semánticos y tokens de dominio (`--gacha-glorious`)— está en
> [`../diseno/71-sistema-de-tokens.md`](../diseno/71-sistema-de-tokens.md) §D7.
> **No implementes los `--color-gachas-*` de arriba.** El principio de "pocos tokens
> y nada de PrimeNG" es lo que sobrevive.

---

## §17 · Tokens PrimeNG existentes

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

- **Sistema de tokens real:** [`../diseno/71-sistema-de-tokens.md`](../diseno/71-sistema-de-tokens.md)
- Punto de salida de PrimeNG (definición de "terminado"): [`11-primeng-decision.md`](./11-primeng-decision.md) §19
- Fase 5 — PrimeNG purge: [`../plan/40-fases.md`](../plan/40-fases.md)
