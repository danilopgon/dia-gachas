# 73 · Marginalia e ilustración

> Fuente: Dirección de diseño §D11. Índice general en [`../README.md`](../README.md).

---

## §D11 · Marginalia y Dither Boy

**Dither Boy es una herramienta de diseño y producción de assets, nunca una
dependencia en runtime.**

La marginalia sirve para introducir identidad humana y humor sin cargar la UI principal.

### Motivos

Crear una pequeña biblioteca de elementos propios:

```text
perol
ajo
cuchara
molino
nube
lluvia
viento
sol hostil
lumbre
oveja
casa manchega
manos / pointers
símbolos meteorológicos
pequeños ornamentos
```

Siguen siendo válidos `harina` y los `sellos del veredicto` del set inicial: §D19
depende del sello.

### Tratamiento

Motivos originales simples, procesados con dither visible:

- una tinta por defecto;
- dos tintas como máximo;
- dither visible, no fotorealista;
- imperfección deliberada;
- contextual al clima o al resultado cuando aporte;
- sin sombras 3D;
- sin volumen plástico.

Evitar:

- ilustración pulida de IA;
- imaginería pseudo-Pixar;
- grabado de fantasía genérico;
- fotorrealismo;
- ilustración “cute” genérica.

Los assets deben funcionar preferentemente en:

```text
ink
paprika
weather-cold / weather-warm
```

### Tokens

```css
:root {
  --illustration-color: var(--color-ink-900);
  --illustration-accent: var(--color-red-500);

  --illustration-opacity-primary: 1;
  --illustration-opacity-secondary: 0.55;
  --illustration-opacity-background: 0.16;

  --dither-size-sm: 64px;
  --dither-size-md: 128px;
  --dither-size-lg: 240px;
}
```

### Regla funcional

Siempre que sea posible, la marginalia debe reaccionar al estado real.

Ejemplos:

```text
lluvia  → nube dither / gotas
viento  → molino / líneas de viento
frío    → perol humeante
calor   → sol hostil
score alto → sello / perol protagonista
```

Así la decoración se convierte en parte del producto.

---

## Documentos relacionados

- La marginalia es `aria-hidden` por defecto: [`76-accesibilidad-visual.md`](./76-accesibilidad-visual.md) §D22
- Variación por clima: [`75-pantallas.md`](./75-pantallas.md) §D20
- Reutilización de las ilustraciones actuales: [`70-direccion-visual.md`](./70-direccion-visual.md) §D5
- Sustitución de PrimeIcons por SVG propios: [`../frontend/12-primeng-sustituciones.md`](../frontend/12-primeng-sustituciones.md) §9
- Fase D5 (Marginalia): [`77-implantacion.md`](./77-implantacion.md)
