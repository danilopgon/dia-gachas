# 73 · Marginalia e ilustración

> Fuente: Dirección de diseño §D11. Índice general en [`../README.md`](../README.md).

---

## §D11 · Marginalia y Dither Boy

**Dither Boy encaja como herramienta de producción visual**, no como dependencia runtime.

La marginalia sirve para introducir identidad humana y humor sin cargar la UI principal.

### Motivos

Crear una pequeña biblioteca de elementos propios:

- perol;
- ajo;
- cuchara;
- harina;
- molino;
- nube;
- lluvia;
- viento;
- sol hostil;
- lumbre;
- oveja;
- casa o silueta rural;
- mano señalando;
- símbolos meteorológicos reinterpretados;
- pequeños ornamentos;
- sellos del veredicto.

### Tratamiento

- una tinta por defecto;
- dos tintas como máximo;
- dither visible, no fotorealista;
- imperfección deliberada;
- sin sombras 3D;
- sin volumen plástico;
- sin ilustración “cute” genérica.

Los assets deben funcionar preferentemente en:

```text
ink
paprika
weather-accent
```

### Tokens

```css
:root {
  --illustration-primary: var(--ink-900);
  --illustration-accent: var(--paprika-500);

  --illustration-opacity-primary: 1;
  --illustration-opacity-secondary: 0.55;
  --illustration-opacity-background: 0.14;

  --marginalia-sm: 4rem;
  --marginalia-md: 8rem;
  --marginalia-lg: 15rem;
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
