# 12 · Sustituciones UI (componente a componente)

> Fuente: BRS §7, §8, §9, §10, §14, §15. Índice general en [`../README.md`](../README.md).
>
> No basta con quitar PrimeNG: lo que se pone en su lugar tiene dirección de arte.
> Lee [`../diseno/71-sistema-de-tokens.md`](../diseno/71-sistema-de-tokens.md) antes
> de decidir un color, un radio o una sombra.
>
> El inventario de dónde se usa cada componente PrimeNG está en
> [`../01-estado-actual.md`](../01-estado-actual.md) §6.
> El autocomplete tiene documento propio: [`14-autocomplete-accesible.md`](./14-autocomplete-accesible.md).

---

## §7 · Mapa de equivalencias UI

| PrimeNG | Sustitución |
|---|---|
| `p-button` | `<button>` / `<a>` nativo + Tailwind |
| `p-floatlabel` | `<label>` + `<input>` propio |
| `p-autocomplete` | Angular ARIA Combobox + Listbox + CDK Overlay |
| `p-popover` | HTML Popover API o pequeño componente propio |
| `p-toast` | signal-based toast / live region |
| `MessageService` | servicio propio mínimo |
| `PrimeIcons` | SVG inline propios |
| PrimeNG themes | CSS variables + Tailwind |
| `text-surface-*` | tokens propios |

---

## §8 · Botones

Los botones no justifican dependencia alguna.

Sustituir:

```html
<p-button />
```

por:

```html
<button type="button">
```

estilado con Tailwind.

Crear, si evita duplicación real:

```text
ButtonComponent
```

Pero solo si existe suficiente repetición.

No construir:

```text
ButtonModule
ButtonDirective
ButtonService
ButtonFactory
```

para tres botones.

---

## §9 · Iconos

Los iconos utilizados son muy pocos:

```text
search
share
info
```

No introducir otra icon library completa salvo que el número crezca significativamente.

Preferencia:

```text
SVG inline
```

o pequeños componentes:

```text
SearchIcon
ShareIcon
InfoIcon
```

Esto permite eliminar:

```text
primeicons
```

completamente.

---

## §10 · Float label

El `p-floatlabel` actual se reemplazará por markup propio.

Preferencia:

```text
label accesible
input
Tailwind
```

La estética puede conservar el efecto flotante mediante CSS si merece la pena.

La funcionalidad y accesibilidad tienen prioridad sobre clonar exactamente el componente PrimeNG.

---

## §14 · Popover de créditos

Actualmente existe un botón flotante que abre créditos, enlaces y atribución AEMET.

Se reemplazará preferentemente mediante:

```text
HTML Popover API
```

si el soporte de browsers objetivo resulta suficiente.

Alternativa:

```text
pequeño componente + CDK Overlay
```

No utilizar una librería externa para un único panel informativo.

---

## §15 · Toast

Actualmente se utiliza PrimeNG Toast principalmente para comunicar que un enlace se ha copiado.

Esto no necesita una infraestructura grande.

Crear:

```text
ToastService
```

signal-based, con algo aproximado a:

```text
message = signal<ToastMessage | null>(null)
```

y:

```text
ToastComponent
```

o incluso un simple live region global.

Debe:

- ser accesible;
- usar `aria-live`;
- desaparecer automáticamente;
- soportar únicamente los casos reales del producto.

No recrear toda la API de PrimeNG Toast.

---

## Documentos relacionados

- Uso del toast al compartir: [`16-ui-veredicto-y-share.md`](./16-ui-veredicto-y-share.md) §55
- Theming y retirada de tokens PrimeNG: [`13-theming.md`](./13-theming.md)
- Criterio antes de añadir cualquier dependencia: [`../agents/51-criterio-dependencias.md`](../agents/51-criterio-dependencias.md)
- **Qué aspecto tienen los sustitutos:** [`../diseno/75-pantallas.md`](../diseno/75-pantallas.md) §D15
  (`GachasButton`, `EditorialRule`, `WeatherDatum`…), iconografía en
  [`../diseno/73-marginalia-e-ilustracion.md`](../diseno/73-marginalia-e-ilustracion.md) §D11
