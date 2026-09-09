# 24 · Dominio de gachas y nueva funcionalidad

> Fuente: BRS §47, §48, §50, §51. Índice general en [`../README.md`](../README.md).
>
> Aquí vive la **mejora funcional** de toda la migración: la app no solo dirá si
> hace día de gachas, sino **por qué**.

---

## 47. Dominio de gachas

Crear:

```text
WeatherConditions
GachasLevel
GachasVerdict
GachasScoringPolicy
```

Portar los tests existentes como especificación antes de modificar reglas.

---

## 48. Nueva funcionalidad

Actualmente:

```text
GachasLevel
```

Nuevo dominio:

```text
GachasVerdict
├── Score
├── Level
└── Reasons
```

Ejemplo:

```json
{
  "score": 6,
  "level": "high",
  "reasons": [
    "Hace bastante frío",
    "Hay alta probabilidad de lluvia",
    "El cielo estará cubierto"
  ]
}
```

---

## 50. Typo launch/lunch

No propagar internamente:

```text
launchTemperature
```

Dominio:

```text
LunchTemperature
```

DTO de compatibilidad:

```text
launchTemperature
```

El typo se conserva únicamente mientras sea necesario por compatibilidad pública.

---

## 51. Mejor día para gachas

Comparar los dos días ya procesados.

Añadir:

```text
bestForGachas
```

No ampliar scope.

No:

```text
forecast 7 días
cuentas
favoritos
notificaciones
```

---

## Documentos relacionados

- Contrato público resultante: [`25-contratos-api.md`](./25-contratos-api.md) §49
- Cómo lo renderiza Angular: [`../frontend/16-ui-veredicto-y-share.md`](../frontend/16-ui-veredicto-y-share.md)
- Tests de dominio: [`27-testing-backend.md`](./27-testing-backend.md)
- Fases 14 y 17: [`../plan/40-fases.md`](../plan/40-fases.md)
