# 22 · Feature Cities (búsqueda e importación)

> Fuente: BRS §40, §41, §42. Índice general en [`../README.md`](../README.md).

---

## §40 · SearchCities

Mantener:

```http
GET /cities?name=Cue
```

Respuesta:

```json
{
  "status": "ok",
  "data": [
    {
      "id": "16078",
      "name": "Cuenca",
      "provinceId": "16",
      "province": {
        "id": "16",
        "name": "Cuenca"
      }
    }
  ]
}
```

Sin resultados:

```json
{
  "status": "ok",
  "data": []
}
```

No reproducir pseudo-404 en body.

---

## §41 · SearchCitiesQuery

Debe utilizar:

```text
Trim
validation
CancellationToken
AsNoTracking
projection
limit
stable ordering
```

Está diseñado para autocomplete.

No devolver relaciones innecesarias.

---

## §42 · ImportMunicipalityCatalogCommand

Los datos de municipios y provincias son reproducibles.

Crear command idempotente:

```text
JSON
 ↓
ImportMunicipalityCatalogCommand
 ↓
EF Core
 ↓
Province / City
```

Debe:

- insertar;
- actualizar nombres;
- evitar duplicados;
- ejecutarse explícitamente;
- soportar una DB vacía.

---

## Documentos relacionados

- Consumidor de este endpoint: [`../frontend/14-autocomplete-accesible.md`](../frontend/14-autocomplete-accesible.md)
- Rate limiting permisivo para autocomplete: [`26-resiliencia.md`](./26-resiliencia.md) §58
- Fases 11 y 12: [`../plan/40-fases.md`](../plan/40-fases.md)
