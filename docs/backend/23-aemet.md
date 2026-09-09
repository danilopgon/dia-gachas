# 23 · Integración AEMET (provider + mapper)

> Fuente: BRS §43, §44, §45, §46. Índice general en [`../README.md`](../README.md).

---

## §43 · Weather actual

Actualmente una sola pieza realiza:

```text
HTTP AEMET
decoding
mapping
temperature calculation
rain calculation
sky interpretation
gachas scoring
```

Esto se separará.

> En el repo actual esa pieza es `backend/src/modules/weather/services/aemet.service.ts`.

---

## §44 · Arquitectura Weather

Objetivo:

```text
AemetForecastProvider
         ↓
AemetForecastMapper
         ↓
WeatherConditions
         ↓
GachasScoringPolicy
         ↓
GachasVerdict
```

---

## §45 · IAemetForecastProvider

Application define:

```text
IAemetForecastProvider
```

Infrastructure implementa:

```text
AemetForecastProvider
```

Responsable de:

```text
HttpClient
API key
timeouts
two-step AEMET flow
Latin-1
deserialization
external failures
```

No contiene reglas de gachas.

---

## §46 · AemetForecastMapper

Transforma:

```text
AEMET DTO
      ↓
internal forecast
```

Mantener comportamiento inicial:

```text
primeros dos días
temperatura 12 / 18
corrected mean
anomalous zero protection
rain-slot priority
sky description
```

---

## Documentos relacionados

- Reglas de gachas (lo que **no** vive aquí): [`24-dominio-gachas.md`](./24-dominio-gachas.md)
- El healthcheck no debe consultar AEMET: [`26-resiliencia.md`](./26-resiliencia.md) §59
- Fase 13 — AEMET infrastructure: [`../plan/40-fases.md`](../plan/40-fases.md)
