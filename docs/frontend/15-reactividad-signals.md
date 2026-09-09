# 15 · Modelo reactivo: Zoneless, OnPush, resources y effects

> Fuente: BRS §26, §27, §28, §29, §30, §31, §32, §54.
> Índice general en [`../README.md`](../README.md).

---

## 26. Zoneless

Eliminar:

```text
zone.js
provideZoneChangeDetection(...)
```

La aplicación debe funcionar naturalmente mediante signals y mecanismos compatibles con Zoneless.

Auditar especialmente:

```text
GSAP
native popover
toast timers
share API
clipboard
overlay
SSR
service worker
```

---

## 27. OnPush

Angular 22 debe trabajar naturalmente con OnPush.

Buscar cualquier compatibilidad temporal:

```text
ChangeDetectionStrategy.Default
ChangeDetectionStrategy.Eager
```

y eliminarla salvo motivo documentado.

Estado mutable de aplicación preferentemente mediante:

```text
signal.set()
signal.update()
```

---

## 28. WeatherResource actual

Actualmente Weather combina:

```text
resource()
HttpClient
firstValueFrom()
manual loader
```

Se modernizará a:

```text
httpResource
```

Flujo:

```text
municipalityCode
       ↓
httpResource
       ↓
GET /weather/{code}
```

El componente consumidor trabajará directamente con:

```text
value()
isLoading()
error()
reload()
```

---

## 29. CitiesResource actual

Actualmente la búsqueda realiza manualmente:

```text
effect
setTimeout
clearTimeout
resource
HttpClient
firstValueFrom
```

Esto se simplificará.

Objetivo:

```text
query
 ↓
debounce
 ↓
httpResource
 ↓
cities
```

Si Signal Forms aporta una solución clara al debounce, utilizarla.

Si no:

```text
signal + RxJS interoperability
```

también es válida.

---

## 30. Effects

Auditar todos los `effect()`.

Mantener únicamente efectos reales.

Ejemplos legítimos:

```text
DOM
analytics
imperative GSAP integration
external browser APIs
```

No usar `effect` para:

```text
A cambia
→ escribir B
```

si puede expresarse mediante:

```text
computed
linkedSignal
resource
```

---

## 31. linkedSignal

Evaluar `linkedSignal` para estados derivados que necesiten conservar conocimiento del valor anterior.

Ejemplo potencial:

```text
último listado válido de ciudades
```

No introducirlo donde una simple `computed()` sea suficiente.

---

## 32. Animaciones

Mantener:

```text
GSAP
```

para animaciones complejas ya existentes.

Para pequeñas transiciones UI:

```text
CSS
animate.enter
animate.leave
```

Evitar nuevas dependencias de:

```text
@angular/animations
```

y retirar `provideAnimationsAsync()` cuando ya no sea necesario.

La eliminación de PrimeNG probablemente facilitará también esta limpieza.

---

## 54. Loading y errors sin PrimeNG

`httpResource` proporcionará el estado async.

Templates:

```text
@if (resource.isLoading()) {}
@else if (resource.error()) {}
@else if (resource.hasValue()) {}
```

No depender de componentes UI externos para estos estados.

---

## Documentos relacionados

- Fases 7 y 9 del plan: [`../plan/40-fases.md`](../plan/40-fases.md)
- Mapeo de errores del backend a mensajes de producto: [`../backend/25-contratos-api.md`](../backend/25-contratos-api.md) §56
- Derivación del veredicto en la UI: [`16-ui-veredicto-y-share.md`](./16-ui-veredicto-y-share.md)
