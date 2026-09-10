# 75 · Pantallas y componentes propios

> Fuente: Dirección de diseño §D15–§D21. Índice general en [`../README.md`](../README.md).

---

## §D15 · Primitives propios

Solo crear los componentes que Día de Gachas necesita.

Candidatos:

```text
CityAutocomplete
GachasButton
EditorialRule
WeatherDatum
Gachometer
VerdictSeal
Marginalia
Toast
ShareAction
```

No todos tienen que ser componentes Angular.

`EditorialRule`, por ejemplo, puede ser puro CSS/HTML.

La regla sigue siendo:

```text
HTML nativo
+
Tailwind
+
Angular
+
Angular ARIA
+
CDK cuando haga falta
```

No sustituir PrimeNG por otra librería de UI generalista.

---

## §D16 · Home objetivo

La home actual tiene:

```text
¿Hace día de gachas?
¡Busca tu pueblo y descúbrelo!
[autocomplete]
[Consulta al oráculo de las gachas]
```

El flujo se conserva.

La composición cambia.

### Jerarquía sugerida

```text
DÍA DE GACHAS                          [marginalia]

¿HACE DÍA
DE GACHAS?

Consulta el parte.
El cielo decidirá.

──────────────────────────────────────

BUSCA TU PUEBLO
[ Cuenca, Cuenca                    ]

[ CONSULTA AL ORÁCULO ]

──────────────────────────────────────

Parte elaborado con datos meteorológicos.
No nos hacemos responsables de las sobremesas.
```

La home debe tener más aire y menos sensación de formulario centrado en una landing.

### Search

El autocomplete propio debe sentirse como un campo editorial/instrumental:

- borde inferior o contorno seco;
- label clara;
- altura generosa;
- dropdown legible;
- foco muy visible;
- sin float-label ornamental;
- sin pill;
- sin sombra suave.

---

## §D17 · Resultado objetivo

La pantalla de resultado pasa a ser la pieza principal de identidad.

### Orden

```text
1. Lugar + fecha
2. Veredicto
3. Score / Gachómetro
4. Razones meteorológicas
5. Mejor día si aplica
6. Acción de compartir
7. Marginalia contextual
```

### Ejemplo

```text
CUENCA · 10 SEP 2026

HOY SÍ.

Hay día de gachas.

──────────────────────────────────────

GACHÓMETRO

NO ├────┼────┼────┼────●──┤ SACA EL PEROL
                         5/6

──────────────────────────────────────

LOS AUGURIOS

TEMPERATURA                 11°
LLUVIA                      73%
CIELO                  CUBIERTO

🥶 Hace fresco.
🌧 La lluvia acompaña.
☁️ El cielo ha entendido la tarea.

──────────────────────────────────────

[ COMPARTIR EL VEREDICTO ]

Buscar otro pueblo
```

Los emoji del ejemplo representan contenido, no dirección iconográfica final. Preferir iconos propios/marginalia cuando exista el asset correspondiente.

---

## §D18 · El Gachómetro

El `score` deja de representarse como un número suelto siempre que haya espacio suficiente.

El Gachómetro es un componente de marca.

### Visual

```text
NO ├──────┼──────┼──────┼──●───┤ SACA EL PEROL
                         5/6
```

### Component tokens

```css
:root {
  --gachometer-track: var(--ink-900);
  --gachometer-marker: var(--paprika-500);

  --gachometer-height: 2px;
  --gachometer-tick-height: 12px;
  --gachometer-marker-size: 18px;
}
```

Debe ser accesible:

- el valor numérico existe en texto;
- la representación gráfica no es la única fuente de información;
- no depender solo de color.

---

## §D19 · Veredicto y sellos

Los niveles de gachas pueden generar lenguaje visual propio.

Ejemplos de copy:

```text
NO ES DÍA
La Mancha no perdona.

PUEDE SER
Ve comprando harina.

HAY DÍA
Convoca a la cuadrilla.

DÍA GLORIOSO
Saca el perol.
```

Un `VerdictSeal` puede utilizar:

- borde irregular;
- dither;
- tipografía display;
- pimentón;
- pequeña rotación;
- composición de sello.

No debe parecer un badge de estado de un dashboard.

---

## §D20 · Clima como variante visual

No crear un “theme engine” complejo.

Sí permitir pequeñas variaciones semánticas.

```html
<body
  data-weather="rain"
  data-gacha-level="glorious"
>
```

Ejemplo:

```css
[data-weather="rain"] {
  --weather-accent: var(--sky-500);
  --illustration-opacity-background: 0.20;
}

[data-weather="cold"] {
  --weather-accent: var(--sky-700);
}

[data-weather="sun"] {
  --weather-accent: var(--earth-500);
}

[data-gacha-level="glorious"] {
  --illustration-accent: var(--paprika-500);
}
```

Las variaciones deben ser sutiles.

No transformar toda la interfaz con cada respuesta meteorológica.

---

## §D21 · Share-first

El core loop sigue siendo:

```text
consultar
↓
recibir veredicto
↓
reírse
↓
compartir
```

El resultado móvil debe ser screenshot-worthy.

### Recomendación

Diseñar el bloque principal de resultado de forma que pueda convertirse en una futura `ShareCard` sin rediseñarlo desde cero.

La pieza compartible debería incluir:

- municipio;
- fecha;
- veredicto;
- score;
- una razón destacada;
- marca Día de Gachas;
- marginalia contextual.

La UI de share sigue usando:

- Web Share API cuando esté disponible;
- clipboard como fallback;
- ToastService accesible propio.

---

## Documentos relacionados

- Contenido funcional de estas pantallas (`score`, `reasons`, `bestDay`, share): [`../frontend/16-ui-veredicto-y-share.md`](../frontend/16-ui-veredicto-y-share.md)
- El autocomplete accesible por dentro: [`../frontend/14-autocomplete-accesible.md`](../frontend/14-autocomplete-accesible.md)
- Botones, toast e iconos sin PrimeNG: [`../frontend/12-primeng-sustituciones.md`](../frontend/12-primeng-sustituciones.md)
- De dónde salen `score`, `reasons` y `bestForGachas`: [`../backend/24-dominio-gachas.md`](../backend/24-dominio-gachas.md)
- Fases D3 y D4: [`77-implantacion.md`](./77-implantacion.md)
