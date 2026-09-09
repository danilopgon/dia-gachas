# 25 · Contratos de API, errores y paridad

> Fuente: BRS §49, §56, §63. Índice general en [`../README.md`](../README.md).
>
> El contrato de `GET /cities` está en [`22-cities.md`](./22-cities.md) §40.

---

## 49. Contrato Weather nuevo

Mantener compatibilidad:

```json
{
  "status": "ok",
  "data": [
    {
      "town": "Cuenca",
      "province": "Cuenca",
      "date": "2026-09-09",

      "launchTemperature": 12,
      "launchTimeRainProbability": 70,
      "skyStatus": "Cubierto",
      "gachasLevel": "high",

      "gachasScore": 6,
      "gachasReasons": [
        "Hace bastante frío",
        "Hay alta probabilidad de lluvia",
        "El cielo estará cubierto"
      ],

      "bestForGachas": true
    }
  ]
}
```

Los nuevos campos son aditivos.

---

## 56. ProblemDetails

Backend utilizará semántica HTTP real:

```text
400 invalid input
404 resource missing
429 rate limit
502 AEMET unavailable
500 unexpected error
```

y:

```text
ProblemDetails
```

Angular deberá mapear esos errores a mensajes de producto.

---

## 63. Contract parity

Durante coexistencia:

```text
Nest
GET /cities
GET /weather

vs

.NET
GET /cities
GET /weather
```

Normalizar y comparar.

Documentar diferencias deliberadas.

---

## Documentos relacionados

- Origen de `gachasScore` / `gachasReasons` / `bestForGachas`: [`24-dominio-gachas.md`](./24-dominio-gachas.md)
- Typo `launchTemperature` (compatibilidad pública): [`24-dominio-gachas.md`](./24-dominio-gachas.md) §50
- Contract tests en CI: [`../ops/31-ci.md`](../ops/31-ci.md)
- Fases 17, 18 y 20: [`../plan/40-fases.md`](../plan/40-fases.md)
