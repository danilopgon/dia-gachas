# 17 · Testing y accesibilidad (frontend)

> Fuente: BRS §33, §61, §62. Índice general en [`../README.md`](../README.md).

---

## §33 · Testing frontend (runner)

Estado actual:

```text
Jest
```

Estado objetivo preferente:

```text
Vitest
```

Secuencia:

```text
Angular estable
→ PrimeNG eliminado
→ tests funcionando
→ Jest → Vitest
```

No mezclar test runner migration con component migration.

---

## §61 · Testing frontend (cobertura)

Cubrir:

```text
CityAutocomplete
CitiesResource
WeatherResource
HomeComponent
ResultComponent
Toast
loading
errors
keyboard autocomplete
selection
new Weather fields
reasons
best day
```

Especial atención a accesibilidad del autocomplete.

---

## §62 · Accessibility tests

La retirada de PrimeNG convierte al proyecto en responsable directo de su UI.

Por tanto deben comprobarse:

```text
keyboard navigation
focus
labels
aria-live
combobox semantics
listbox semantics
disabled states
error announcements
```

No considerar terminada la sustitución del autocomplete únicamente porque “se puede clicar”.

---

## Documentos relacionados

- Fase 8 — Vitest: [`../plan/40-fases.md`](../plan/40-fases.md)
- CI frontend: [`../ops/31-ci.md`](../ops/31-ci.md)
- Definition of Done frontend: [`../agents/53-definition-of-done.md`](../agents/53-definition-of-done.md)
