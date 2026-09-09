# 16 · UI del nuevo veredicto y compartir

> Fuente: BRS §52, §53, §55. Índice general en [`../README.md`](../README.md).

---

## §52 · Angular consume Weather nuevo

El frontend Angular 22 debe derivar:

```text
today
tomorrow
score
reasons
bestDay
icon
message
```

mediante:

```text
computed()
```

siempre que sea posible.

Evitar estado duplicado.

---

## §53 · UI del nuevo veredicto

Mantener estética actual.

Añadir:

```text
HOY ES DÍA DE GACHAS

¿Por qué?

🥶 Hace bastante frío
🌧️ Alta probabilidad de lluvia
☁️ Cielo cubierto

Score gachero: 6/6
```

Y opcionalmente:

```text
Mañana pinta todavía mejor
```

No rediseñar toda la pantalla.

---

## §55 · Share feedback

Al copiar enlace:

```text
navigator.clipboard
      ↓
ToastService propio
      ↓
aria-live
```

Si `navigator.share` está disponible:

```text
Web Share API
```

La experiencia actual se mantiene sin PrimeNG MessageService.

---

## Documentos relacionados

- Contrato que alimenta esta pantalla: [`../backend/25-contratos-api.md`](../backend/25-contratos-api.md) §49
- Dominio del veredicto (`score`, `reasons`, `bestForGachas`): [`../backend/24-dominio-gachas.md`](../backend/24-dominio-gachas.md)
- ToastService propio: [`12-primeng-sustituciones.md`](./12-primeng-sustituciones.md) §15
