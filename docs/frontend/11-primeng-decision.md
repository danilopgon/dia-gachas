# 11 · PrimeNG: decisión, filosofía y estrategia de salida

> Fuente: BRS §4, §5, §18, §19, §22. Índice general en [`../README.md`](../README.md).

---

## §4 · Decisión sobre PrimeNG

No se adoptará PrimeNG 22.

El objetivo final es:

```text
PrimeNG dependencies = 0
```

Eliminar:

```text
primeng
@primeng/themes
primeicons
tailwindcss-primeui
```

Y cualquier:

```text
providePrimeNG(...)
PrimeNG config
PrimeNG theme preset
PrimeNG MessageService
PrimeNG templates
p-button
p-autocomplete
p-floatlabel
p-popover
p-toast
```

La UI quedará bajo control directo del proyecto.

---

## §5 · Filosofía de sustitución de PrimeNG

No sustituir una component library grande por otra component library grande.

Preferencia:

```text
HTML nativo
+
Tailwind CSS
+
Angular
+
Angular ARIA
+
Angular CDK cuando sea necesario
```

Angular 22 proporciona primitives oficiales para patrones accesibles como combobox/listbox mediante `@angular/aria`, combinables con CDK Overlay. Esto encaja especialmente bien con el autocomplete de municipios.

No crear un design system genérico.

Crear únicamente primitives que Día de Gachas necesite.

---

## §18 · Estrategia de transición PrimeNG

No intentar actualizar directamente:

```text
PrimeNG 19 → PrimeNG 22
```

La versión 22 nunca será estado objetivo.

La secuencia recomendada será:

```text
Angular 19 + PrimeNG 19
        ↓
Angular 20 + dependencia UI compatible temporal
        ↓
Angular 21 + dependencia UI compatible temporal
        ↓
retirada completa PrimeNG
        ↓
Angular 21 sin PrimeNG
        ↓
Angular 22
```

Si los peer dependencies obligan a actualizar PrimeNG 19 → 20 → 21 temporalmente durante los majors Angular, está permitido.

Esas versiones serán únicamente **dependencies de transición**.

No se desarrollará nueva UI PrimeNG durante ese periodo.

---

## §19 · Punto de salida de PrimeNG

PrimeNG debe desaparecer **antes de considerar terminado el salto a Angular 22**.

Definition:

```text
npm dependency tree
→ ninguna dependencia PrimeNG/PrimeUI
```

Y:

```text
grep "primeng"
→ 0 código de aplicación
```

salvo documentación histórica de la migración.

---

## §22 · Retirada de PrimeNG

La retirada se realizará preferentemente sobre Angular 21, donde ya están disponibles varias primitives modernas que facilitan la sustitución.

Orden:

```text
1. Button
2. icons
3. FloatLabel
4. Popover
5. Toast
6. theme
7. AutoComplete
8. eliminar dependencias
```

El autocomplete se deja para el final por ser la pieza con mayor riesgo funcional/accesible.

---

## Documentos relacionados

- Sustituciones concretas componente a componente: [`12-primeng-sustituciones.md`](./12-primeng-sustituciones.md)
- Theming y tokens: [`13-theming.md`](./13-theming.md)
- Autocomplete accesible: [`14-autocomplete-accesible.md`](./14-autocomplete-accesible.md)
- Huella actual de PrimeNG: [`../01-estado-actual.md`](../01-estado-actual.md) §6
