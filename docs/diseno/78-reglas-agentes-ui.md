# 78 · Reglas para agentes que tocan UI

> Fuente: Dirección de diseño §D26. Índice general en [`../README.md`](../README.md).
>
> Complementa a [`../agents/50-instrucciones-generales.md`](../agents/50-instrucciones-generales.md):
> aquellas reglas aplican a todo el repo; estas, además, a cualquier cambio visual.

---

## §D26 · Reglas para agentes

Cuando un agente implemente UI en Día de Gachas:

### Debe

- consultar este documento antes de diseñar;
- reutilizar tokens antes de crear valores nuevos;
- preferir HTML semántico;
- respetar la jerarquía editorial;
- preservar accesibilidad;
- mantener los componentes específicos del dominio pequeños;
- comprobar mobile antes de dar una vista por terminada.

### No debe

- introducir una component library;
- inventar un theme genérico;
- añadir cards porque “organizan” contenido;
- añadir gradientes sin una decisión explícita;
- añadir radios grandes;
- añadir sombras suaves genéricas;
- convertir estados en pills;
- usar iconografía 3D;
- generar ilustraciones de estilo genérico;
- añadir movimiento continuo sin propósito;
- “modernizar” hacia una estética SaaS.

Ante duda:

> menos chrome, más jerarquía; menos decoración genérica, más identidad del dominio.

---

## Qué leer antes de tocar una vista

No hace falta cargar los nueve documentos de diseño. Con esto basta:

| Vas a tocar… | Lee |
|---|---|
| Colores, tipos, espaciado, sombras | [`71-sistema-de-tokens.md`](./71-sistema-de-tokens.md) |
| La estructura de una pantalla | [`72-composicion-y-layout.md`](./72-composicion-y-layout.md) |
| Home o Result | [`75-pantallas.md`](./75-pantallas.md) |
| Iconos o ilustración | [`73-marginalia-e-ilustracion.md`](./73-marginalia-e-ilustracion.md) |
| Animación o transiciones | [`74-movimiento.md`](./74-movimiento.md) |
| Cualquiera de las anteriores | [`76-accesibilidad-visual.md`](./76-accesibilidad-visual.md) |

Y si vas a decidir *qué aspecto tiene algo nuevo*, empieza por
[`70-direccion-visual.md`](./70-direccion-visual.md) §D4: el filtro anti-AI-slop.

---

## Documentos relacionados

- Reglas generales del repo: [`../agents/50-instrucciones-generales.md`](../agents/50-instrucciones-generales.md)
- Criterio antes de añadir una dependencia: [`../agents/51-criterio-dependencias.md`](../agents/51-criterio-dependencias.md)
- Definition of Done visual: [`77-implantacion.md`](./77-implantacion.md) §D25
