# 16 · UI del nuevo veredicto y compartir

> Fuente: BRS §52, §53, §55. Índice general en [`../README.md`](../README.md).
>
> ⚠️ **La parte visual de §53 está superada.** La dirección de diseño
> ([`../diseno/70-direccion-visual.md`](../diseno/70-direccion-visual.md)) sustituye
> "mantener la estética actual" por un rediseño editorial completo. Lo que sigue
> vigente de este documento es **todo lo funcional**: qué se deriva con `computed()`,
> qué información aparece, el orden del contenido y el comportamiento del share.

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

> **Superado en su parte visual.** "Mantener estética actual" y "no rediseñar toda
> la pantalla" ya no aplican: el resultado pasa a ser *la* pieza de identidad del
> producto. Ver [`../diseno/75-pantallas.md`](../diseno/75-pantallas.md) §D17 y el
> Gachómetro en §D18.
>
> Lo que **sí** sigue vigente de §53: el contenido a mostrar (veredicto, "¿por qué?",
> razones, score, mejor día) y el no ampliar el alcance funcional de la pantalla.

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

> Esta última línea es la que la dirección de diseño revoca explícitamente.
> El alcance **funcional** sigue sin ampliarse; el alcance **visual** sí.

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
- **Cómo se ve todo esto:** [`../diseno/75-pantallas.md`](../diseno/75-pantallas.md) §D17, §D18, §D19, §D21
