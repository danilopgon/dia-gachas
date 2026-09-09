# 14 · Autocomplete accesible de municipios

> Fuente: BRS §11, §12, §13, §23. Índice general en [`../README.md`](../README.md).
>
> Es la sustitución con mayor riesgo funcional y de accesibilidad de todo el proyecto.
> Por eso se deja **la última** dentro de la retirada de PrimeNG
> (ver [`11-primeng-decision.md`](./11-primeng-decision.md) §22) y tiene fase propia
> (Fase 4 en [`../plan/40-fases.md`](../plan/40-fases.md)).

---

## 11. Autocomplete de municipios

Es la sustitución más importante.

La solución objetivo en Angular moderno será:

```text
query signal
      ↓
debounce
      ↓
httpResource
      ↓
cities
      ↓
Angular ARIA Combobox
      +
Angular ARIA Listbox
      +
CDK Connected Overlay
```

Debe soportar correctamente:

```text
teclado
ArrowUp / ArrowDown
Enter
Escape
focus
screen readers
active descendant
selección
loading
sin resultados
```

No implementar accesibilidad manualmente si Angular ya proporciona primitives oficiales.

---

## 12. Componente CityAutocomplete

Crear un componente específico:

```text
CityAutocompleteComponent
```

No:

```text
GenericAutocomplete<T>
```

al menos inicialmente.

API aproximada:

```text
query
selectedCity
cities
loading
error
```

El componente debe ser reusable dentro de Día de Gachas, no intentar convertirse en librería pública.

---

## 13. Signal Forms

Evaluar utilizar Signal Forms para el selector de municipio.

Puede encapsular:

```text
query
selectedCity
validation
debounce
```

Si mejora realmente el código, será uno de los ejemplos deliberados de Angular 22 en el proyecto.

Si la combinación con Angular ARIA resulta más clara mediante signals directos, no forzar Signal Forms.

El objetivo es código idiomático, no una checklist.

---

## 23. Angular ARIA

Para el autocomplete utilizar primitives oficiales:

```text
@angular/aria/combobox
@angular/aria/listbox
@angular/cdk/overlay
```

El objetivo es delegar en Angular:

```text
focus management
ARIA semantics
keyboard navigation
active option
selection behavior
```

y dejar al proyecto:

```text
datos
estilos
producto
```

---

## Documentos relacionados

- `CitiesResource` y el debounce actual: [`15-reactividad-signals.md`](./15-reactividad-signals.md) §29
- Tests de accesibilidad obligatorios: [`17-testing-frontend.md`](./17-testing-frontend.md) §62
- Endpoint que lo alimenta: [`../backend/22-cities.md`](../backend/22-cities.md)
