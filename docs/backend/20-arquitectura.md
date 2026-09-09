# 20 · Arquitectura del backend .NET

> Fuente: BRS §34, §35, §36, §37. Índice general en [`../README.md`](../README.md).

---

## 34. Backend objetivo

Crear:

```text
backend-dotnet/
├── src/
│   ├── DiaGachas.Api/
│   ├── DiaGachas.Application/
│   ├── DiaGachas.Domain/
│   └── DiaGachas.Infrastructure/
│
└── tests/
    ├── DiaGachas.Domain.Tests/
    ├── DiaGachas.Application.Tests/
    ├── DiaGachas.IntegrationTests/
    └── DiaGachas.ArchitectureTests/
```

---

## 35. Arquitectura

Dependencias:

```text
Domain
  ↑
Application
  ↑
Infrastructure

Api
 ├── Application
 └── Infrastructure
```

Domain no conoce:

```text
ASP.NET
EF Core
HTTP
JSON
AEMET
MySQL
MediatR
```

---

## 36. Organización funcional

No organizar exclusivamente:

```text
Controllers/
Services/
Repositories/
Dtos/
```

Organizar por feature:

```text
Application/
├── Cities/
│   ├── SearchCities/
│   └── ImportMunicipalityCatalog/
│
└── Weather/
    └── GetWeatherForecast/
```

---

## 37. CQRS

Queries:

```text
SearchCitiesQuery
GetWeatherForecastQuery
```

Command:

```text
ImportMunicipalityCatalogCommand
```

No crear commands para lecturas.

No separar físicamente read/write DBs.

No event sourcing.

---

## Documentos relacionados

- Lo que **no** se introduce en backend (microservices, Kafka, generic repository…): [`../00-vision-y-alcance.md`](../00-vision-y-alcance.md) §74
- Tests de arquitectura que verifican estos boundaries: [`27-testing-backend.md`](./27-testing-backend.md)
- Fase 10 — .NET skeleton: [`../plan/40-fases.md`](../plan/40-fases.md)
