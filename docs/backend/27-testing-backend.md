# 27 · Testing backend

> Fuente: BRS §60. Índice general en [`../README.md`](../README.md).

---

## 60. Testing backend

### Domain

```text
GachasScoringPolicy
```

### Application

```text
SearchCities
GetWeatherForecast
ImportMunicipalityCatalog
```

### Infrastructure

```text
AemetForecastMapper
AemetForecastProvider
EF mappings
```

### Integration

```text
WebApplicationFactory
Testcontainers MySQL
```

### Architecture

Verificar boundaries Clean.

---

## Documentos relacionados

- Boundaries que los architecture tests deben verificar: [`20-arquitectura.md`](./20-arquitectura.md) §35
- Los tests actuales de Nest se portan como especificación: [`24-dominio-gachas.md`](./24-dominio-gachas.md) §47
- CI backend: [`../ops/31-ci.md`](../ops/31-ci.md)
