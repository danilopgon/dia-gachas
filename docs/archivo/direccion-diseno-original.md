<!--
  DOCUMENTO CONGELADO — NO EDITAR.

  Dirección de diseño original ("18 · Dirección de diseño — Future Medieval Manchego"),
  conservada íntegra por trazabilidad histórica.

  NO es la fuente de verdad operativa. La fuente de verdad viva es `docs/diseno/`,
  indexada desde `AGENTS.md` y `docs/README.md`, donde cada sección se cita como §DN.

  Si detectas una discrepancia entre este archivo y `docs/diseno/`, gana `docs/diseno/`.
  Los agentes NO deben cargar este archivo salvo para auditar trazabilidad.
-->

# 18 · Dirección de diseño — Future Medieval Manchego

> Documento de dirección visual para la modernización de **Día de Gachas**.
>
> Estado: propuesta objetivo para la rama de migración.
>
> Este documento redefine la dirección visual del frontend. **Sustituye la intención de “mantener la estética actual”** descrita en `frontend/16-ui-veredicto-y-share.md` y debe terminar reemplazando la parte visual de `frontend/.impeccable.md`. Las decisiones funcionales de esos documentos —score, razones del veredicto, share, accesibilidad, etc.— siguen vigentes.

---

## 1. Contexto

La rama `dev` actual tiene una identidad reconocible, pero la interfaz sigue dependiendo en gran medida de:

- fondos rurales ilustrados a pantalla completa;
- componentes PrimeNG;
- tokens visuales heredados de PrimeNG (`text-surface-50`, theme, etc.);
- una jerarquía de UI típica de landing/app;
- iconografía meteorológica convencional;
- PPWoodland + Alegreya Sans como base tipográfica;
- GSAP para movimiento ambiental.

La migración Angular 19 → 22 ya incluye la retirada completa de PrimeNG y devuelve el control visual al proyecto. Ese cambio es una oportunidad para que la UI deje de parecer una app meteorológica personalizada y pase a tener **una dirección de arte propia**.

La nueva interfaz debe ser identificable como Día de Gachas incluso sin logo.

---

# 2. Concepto rector

## Future Medieval Manchego / Vernacular Editorial

La referencia mental es:

> **Bando municipal × recetario castellano × grabado medieval × estación meteorológica × fanzine contemporáneo.**

No buscamos una web “medieval” literal.

No queremos:

- fantasy UI;
- Skyrim;
- pergamino falso;
- taberna temática;
- heráldica por todas partes;
- dark fantasy;
- una landing de SaaS vestida de medieval.

Queremos una **interfaz contemporánea que utiliza lenguaje gráfico histórico, rural y editorial**.

La sensación debería ser que un concejo castellano hubiera publicado el parte meteorológico para decidir si hoy salen las gachas.

---

# 3. Personalidad

La personalidad actual sigue siendo válida:

- chanante;
- regional;
- seca;
- absurda;
- cercana;
- orgullosamente pequeña.

Pero la ejecución visual cambia.

La app debe sentirse:

- **hecha por humanos**, no ensamblada a partir de componentes estándar;
- **local**, sin convertirse en souvenir manchego;
- **editorial**, no “dashboard”;
- **táctil**, sin intentar simular materiales de forma literal;
- **rara con control**, no caótica;
- **divertida sin explicar el chiste**.

El humor sigue siendo UX.

---

# 4. Principio anti-AI-slop

Cada decisión visual debe superar esta pregunta:

> ¿Podría esta pantalla aparecer casi igual en una landing generada automáticamente para una startup cualquiera?

Si la respuesta es sí, la decisión necesita más identidad.

## Evitar explícitamente

- glassmorphism;
- blobs decorativos;
- auroras y gradientes tech;
- tarjetas redondeadas flotantes;
- sombras difusas “premium”;
- bento grids por defecto;
- iconos 3D genéricos;
- ilustración pseudo-Pixar;
- infinitos pills;
- `border-radius: 24px` como lenguaje universal;
- copy tipo “Descubre una nueva forma de…”;
- animaciones de levitación para todo;
- grandes superficies blancas estériles;
- componentes visualmente indistinguibles de shadcn/Material/PrimeNG.

## Regla de proporción

La interfaz objetivo debe sentirse aproximadamente:

```text
80 % editorial funcional
15 % ilustración / dither / textura
 5 % medieval explícito
```

El 5 % medieval es importante: si sube demasiado, el producto se convierte en cosplay.

---

# 5. Qué conservamos del diseño actual

La nueva dirección **no borra todo el trabajo existente**.

Se conservan:

- PPWoodland como display principal mientras su licencia y asset actual sigan siendo válidos;
- Alegreya Sans como texto funcional inicial;
- terracota / pimentón como color identitario;
- humor regional y copy existente que siga funcionando;
- enfoque mobile-first;
- lógica `check → laugh → share`;
- algunas ilustraciones rurales actuales como material de marca;
- GSAP únicamente donde aporte narrativa o ambientación;
- soporte de `prefers-reduced-motion`.

## Qué cambia de las ilustraciones actuales

Los paisajes dejan de ser necesariamente el fondo full-bleed permanente.

Pueden reutilizarse como:

- cabeceras recortadas;
- estampas;
- franjas horizontales;
- fondos de piezas compartibles;
- source material para versiones tramadas/dither;
- pequeñas escenas editoriales.

La UI debe poder sostenerse visualmente sobre una superficie de “papel” sin depender de una ilustración a pantalla completa.

---

# 6. Superficie y composición

## Papel, no card

La unidad visual principal es **la página**, no la tarjeta.

Usar:

- grandes bloques tipográficos;
- reglas horizontales;
- divisores;
- columnas;
- etiquetas pequeñas;
- anotaciones marginales;
- cambios de escala;
- whitespace generoso.

Evitar encerrar cada dato en una caja.

Los datos meteorológicos pueden aparecer como una tabla editorial o un parte:

```text
LOS AUGURIOS
──────────────────────────────

TEMPERATURA                  7°
LLUVIA                       82%
VIENTO                  24 km/h
CIELO                  CUBIERTO

✣ Las condiciones son propicias.
  Que salga el perol.
```

---

# 7. Paleta

La app permanece **light-first / light-only** salvo que exista una razón de producto para introducir otro tema.

## Primitives

```css
:root {
  /* Paper */
  --paper-50:  #f8f4ea;
  --paper-100: #f1eadc;
  --paper-200: #e5d9c3;

  /* Ink */
  --ink-700: #4a453d;
  --ink-800: #302d28;
  --ink-900: #1c1a17;

  /* Paprika */
  --paprika-300: #d9785c;
  --paprika-500: #b84830;
  --paprika-700: #84301f;

  /* Weather */
  --sky-300: #9aabb2;
  --sky-500: #657d87;
  --sky-700: #415861;

  /* Earth */
  --earth-300: #baa47c;
  --earth-500: #8a6d45;
  --earth-700: #5d482e;

  /* Supporting states */
  --olive-500: #69745a;
  --amber-500: #bd8237;
}
```

Los nombres de primitives describen el color, no su intención.

## Semantic tokens

```css
:root {
  --surface-page: var(--paper-50);
  --surface-subtle: var(--paper-100);
  --surface-strong: var(--ink-900);

  --text-primary: var(--ink-900);
  --text-secondary: var(--ink-700);
  --text-inverse: var(--paper-50);

  --border-default: var(--ink-900);
  --border-muted: color-mix(in srgb, var(--ink-900) 30%, transparent);

  --accent-primary: var(--paprika-500);
  --accent-primary-hover: var(--paprika-700);

  --weather-accent: var(--sky-500);

  --state-positive: var(--olive-500);
  --state-warning: var(--amber-500);
  --state-negative: var(--paprika-500);
}
```

## Tokens del dominio

El diseño puede nombrar explícitamente conceptos del producto.

```css
:root {
  --gacha-poor: var(--earth-300);
  --gacha-maybe: var(--amber-500);
  --gacha-good: var(--paprika-500);
  --gacha-glorious: var(--paprika-700);
}
```

Esto es preferible a convertir Día de Gachas en un sistema abstracto de `success/info/warning` típico de dashboard.

El estado “perfecto para gachas” **no tiene por qué ser verde**. El rojo pimentón es más propio del producto.

---

# 8. Tipografía

La tipografía tiene tres funciones, no tres estilos decorativos.

## Display

```css
--font-display: "PPWoodland", serif;
```

Uso:

- marca;
- veredicto;
- titulares principales;
- cifras realmente protagonistas.

Debe utilizarse a gran escala y con moderación.

## Texto

```css
--font-body: "Alegreya", sans-serif;
```

Uso:

- instrucciones;
- copy;
- resultados secundarios;
- mensajes;
- acciones.

## Datos

No es obligatorio introducir un tercer asset tipográfico.

```css
--font-data: ui-monospace, "SFMono-Regular", Consolas, monospace;
```

Uso:

- temperatura;
- porcentaje;
- viento;
- fecha;
- etiquetas técnicas;
- score.

El contraste `display artesanal + dato mono` es una de las claves de la dirección **future medieval**.

## Escala

```css
:root {
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
  --text-2xl: 2rem;

  --text-display-sm: clamp(2.5rem, 7vw, 4rem);
  --text-display-md: clamp(3.5rem, 10vw, 6rem);
  --text-display-xl: clamp(4.5rem, 15vw, 9rem);

  --leading-tight: 0.95;
  --leading-heading: 1.05;
  --leading-body: 1.5;

  --tracking-tight: -0.03em;
  --tracking-wide: 0.08em;
  --tracking-data: 0.12em;
}
```

---

# 9. Espaciado y layout

Mantener una escala pequeña y predecible.

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4rem;
  --space-9: 6rem;
  --space-10: 8rem;

  --layout-gutter: clamp(1rem, 4vw, 3rem);
  --layout-section-gap: clamp(4rem, 9vw, 8rem);
  --layout-content-max: 72rem;
  --layout-reading-max: 42rem;
}
```

La composición debe recordar más a una portada o página editorial que a una colección de widgets.

---

# 10. Bordes, radios y sombras

## Bordes

```css
:root {
  --rule-thin: 1px solid var(--border-default);
  --rule-medium: 2px solid var(--border-default);
  --rule-heavy: 4px solid var(--border-default);
  --rule-double: 3px double var(--border-default);
}
```

Las reglas editoriales son parte del lenguaje visual.

## Radios

```css
:root {
  --radius-none: 0;
  --radius-sm: 2px;
  --radius-md: 4px;
}
```

No introducir radios grandes salvo que un componente tenga una justificación concreta.

## Sombras

```css
:root {
  --shadow-none: none;
  --shadow-hard-sm: 3px 3px 0 var(--ink-900);
  --shadow-hard-md: 6px 6px 0 var(--ink-900);
}
```

Las sombras, cuando existan, deben recordar a:

- impresión desplazada;
- papel superpuesto;
- offset.

No a una card flotando sobre un fondo SaaS.

---

# 11. Marginalia y Dither Boy

**Dither Boy encaja como herramienta de producción visual**, no como dependencia runtime.

La marginalia sirve para introducir identidad humana y humor sin cargar la UI principal.

## Motivos

Crear una pequeña biblioteca de elementos propios:

- perol;
- ajo;
- cuchara;
- harina;
- molino;
- nube;
- lluvia;
- viento;
- sol hostil;
- lumbre;
- oveja;
- casa o silueta rural;
- mano señalando;
- símbolos meteorológicos reinterpretados;
- pequeños ornamentos;
- sellos del veredicto.

## Tratamiento

- una tinta por defecto;
- dos tintas como máximo;
- dither visible, no fotorealista;
- imperfección deliberada;
- sin sombras 3D;
- sin volumen plástico;
- sin ilustración “cute” genérica.

Los assets deben funcionar preferentemente en:

```text
ink
paprika
weather-accent
```

## Tokens

```css
:root {
  --illustration-primary: var(--ink-900);
  --illustration-accent: var(--paprika-500);

  --illustration-opacity-primary: 1;
  --illustration-opacity-secondary: 0.55;
  --illustration-opacity-background: 0.14;

  --marginalia-sm: 4rem;
  --marginalia-md: 8rem;
  --marginalia-lg: 15rem;
}
```

## Regla funcional

Siempre que sea posible, la marginalia debe reaccionar al estado real.

Ejemplos:

```text
lluvia  → nube dither / gotas
viento  → molino / líneas de viento
frío    → perol humeante
calor   → sol hostil
score alto → sello / perol protagonista
```

Así la decoración se convierte en parte del producto.

---

# 12. Movimiento

El movimiento debe ayudar a crear carácter, no demostrar que tenemos GSAP.

## Tokens

```css
:root {
  --motion-fast: 100ms;
  --motion-normal: 180ms;
  --motion-slow: 320ms;

  --ease-snap: cubic-bezier(0.2, 0, 0, 1);
}
```

## UI

Los controles deben sentirse físicos y rápidos.

Ejemplo:

```css
.action:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-sm);
}
```

La sensación es:

> thunk

No:

> floating premium component ✨

## Ambientación

GSAP puede seguir utilizándose para:

- revelar una estampa;
- pequeños parallax;
- desplazamiento ambiental puntual;
- entrada del veredicto;
- detalles de marginalia.

No utilizar loops de movimiento en todos los elementos.

`prefers-reduced-motion` sigue siendo obligatorio.

---

# 13. Design system: arquitectura

No crear un design system empresarial.

No introducir cientos de variables.

No construir abstractions “por si acaso”.

La arquitectura recomendada es:

```text
frontend/src/styles/
├── tokens.css
├── base.css
└── utilities.css
```

Y estilos de componente cerca de su componente cuando tengan sentido.

## Capas

```text
PRIMITIVE
    ↓
SEMANTIC
    ↓
COMPONENT
```

### Primitive

Describe valores.

```text
--paper-50
--ink-900
--paprika-500
--space-4
```

### Semantic

Describe intención.

```text
--surface-page
--text-primary
--accent-primary
--weather-accent
```

### Component

Solo cuando un componente propio necesite contrato visual estable.

```text
--gachometer-marker
--verdict-border
--search-control-height
```

No duplicar un token semántico únicamente para “seguir la arquitectura”.

---

# 14. Tailwind CSS v4

Mantener Tailwind como herramienta de composición.

Los tokens son la fuente de verdad.

Cuando aporte ergonomía, exponerlos mediante `@theme`.

Ejemplo:

```css
@theme {
  --color-paper: var(--surface-page);
  --color-ink: var(--text-primary);
  --color-paprika: var(--accent-primary);
}
```

Evitar que el markup vuelva a llenarse de hexadecimales o decisiones visuales arbitrarias.

Preferir:

```html
<h1 class="text-ink">
```

frente a:

```html
<h1 class="text-[#1c1a17]">
```

La retirada de PrimeNG incluye la eliminación de tokens conceptuales como `text-surface-50`.

---

# 15. Primitives propios

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

# 16. Home objetivo

La home actual tiene:

```text
¿Hace día de gachas?
¡Busca tu pueblo y descúbrelo!
[autocomplete]
[Consulta al oráculo de las gachas]
```

El flujo se conserva.

La composición cambia.

## Jerarquía sugerida

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

## Search

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

# 17. Resultado objetivo

La pantalla de resultado pasa a ser la pieza principal de identidad.

## Orden

```text
1. Lugar + fecha
2. Veredicto
3. Score / Gachómetro
4. Razones meteorológicas
5. Mejor día si aplica
6. Acción de compartir
7. Marginalia contextual
```

## Ejemplo

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

# 18. El Gachómetro

El `score` deja de representarse como un número suelto siempre que haya espacio suficiente.

El Gachómetro es un componente de marca.

## Visual

```text
NO ├──────┼──────┼──────┼──●───┤ SACA EL PEROL
                         5/6
```

## Component tokens

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

# 19. Veredicto y sellos

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

# 20. Clima como variante visual

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

# 21. Share-first

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

## Recomendación

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

# 22. Accesibilidad

La dirección artística nunca puede esconder información.

Mantener como mínimo:

- WCAG AA;
- contrastes suficientes;
- navegación por teclado;
- foco visible;
- labels persistentes cuando sean necesarias;
- `aria-live` en feedback async;
- soporte para reduced motion;
- texto equivalente para indicadores visuales;
- targets táctiles adecuados.

## Marginalia

Por defecto:

```html
aria-hidden="true"
```

salvo que transmita información no disponible en texto.

Nunca introducir ruido a lectores de pantalla por pura decoración.

---

# 23. Responsive

## Mobile

Es la referencia principal.

Prioridades:

- veredicto visible inmediatamente;
- grandes titulares;
- input cómodo;
- compartir con una mano;
- composición screenshot-worthy;
- marginalia pequeña y controlada.

## Desktop

No centrar simplemente una columna móvil en una pantalla enorme.

Aprovechar:

- márgenes;
- composición asimétrica;
- marginalia;
- columnas para datos;
- estampas rurales;
- grandes escalas tipográficas.

La versión desktop puede sentirse más “página impresa desplegada”.

---

# 24. Plan de implantación dentro de la migración

El rediseño debe acoplarse a la retirada de PrimeNG, no convertirse en una migración paralela infinita.

## Fase D1 — Foundation

- crear `tokens.css`;
- mover fuentes y estilos base a una estructura clara;
- definir superficie `paper`;
- definir tinta y pimentón;
- integrar tokens con Tailwind v4;
- eliminar dependencias visuales de `text-surface-*`;
- mantener comportamiento actual.

## Fase D2 — Primitives

Durante la retirada de PrimeNG:

- botón → `GachasButton` / HTML nativo;
- float label → label/input propio;
- toast → ToastService propio;
- autocomplete → `CityAutocomplete` accesible;
- iconos PrimeIcons → iconografía propia o SVG mínimos.

No recrear visualmente PrimeNG.

## Fase D3 — Home

- retirar dependencia del paisaje full-screen;
- implantar layout editorial;
- rediseñar autocomplete;
- introducir primeras reglas y marginalia;
- conservar el flujo funcional.

## Fase D4 — Result

- implantar veredicto protagonista;
- crear Gachómetro;
- estructurar “Los augurios”;
- integrar `score`, `reasons` y `bestDay`;
- rediseñar share.

## Fase D5 — Marginalia

- preparar set inicial con Dither Boy;
- añadir variantes de lluvia/viento/frío/calor;
- revisar peso de assets;
- comprobar que la UI funciona también sin ellos.

## Fase D6 — Motion & polish

- revisar GSAP existente;
- eliminar animación gratuita;
- introducir motion tokens;
- comprobar reduced motion;
- hacer pasada final mobile/desktop.

## Fase D7 — Documentation cleanup

Actualizar:

```text
frontend/.impeccable.md
docs/frontend/13-theming.md
docs/frontend/16-ui-veredicto-y-share.md
docs/README.md
```

para que no existan dos direcciones visuales contradictorias.

---

# 25. Definition of Done visual

La nueva dirección se considera implantada cuando:

- PrimeNG no controla ningún aspecto visual;
- no quedan tokens `surface-*` heredados de PrimeNG;
- home y result utilizan el mismo sistema de tokens;
- no hay colores hex arbitrarios repartidos por templates;
- el layout no depende de cards genéricas;
- el Gachómetro representa visualmente el score;
- `score`, `reasons` y `bestDay` tienen jerarquía clara;
- existe al menos un set coherente de marginalia propia;
- la marginalia funciona como decoración accesible;
- la home funciona sin fondo ilustrado full-screen;
- resultado mobile es compartible/capturable con buena composición;
- `prefers-reduced-motion` funciona;
- contraste y teclado cumplen el mínimo de accesibilidad definido por el proyecto;
- visualmente la app no se confunde con una app meteorológica genérica ni con una landing SaaS.

---

# 26. Reglas para agentes

Cuando un agente implemente UI en Día de Gachas:

## Debe

- consultar este documento antes de diseñar;
- reutilizar tokens antes de crear valores nuevos;
- preferir HTML semántico;
- respetar la jerarquía editorial;
- preservar accesibilidad;
- mantener los componentes específicos del dominio pequeños;
- comprobar mobile antes de dar una vista por terminada.

## No debe

- introducir una component library;
- inventar un theme genérico;
- añadir cards porque “organizan” contenido;
- añadir gradientes sin una decisión explícita;
- añadir radios grandes;
- añadir sombras suaves genéricas;
- convertir estados en pills;
- usar iconografía 3D;
- generar ilustraciones de estilo genérico;
- añadir movimiento continuo sin propósito;
- “modernizar” hacia una estética SaaS.

Ante duda:

> menos chrome, más jerarquía; menos decoración genérica, más identidad del dominio.

---

# 27. Resumen ejecutivo

La modernización visual de Día de Gachas no consiste en hacer la interfaz “más moderna”.

Consiste en hacerla **más propia**.

El objetivo final combina:

```text
UI contemporánea y accesible
+
composición editorial
+
identidad manchega
+
humor seco
+
dither / marginalia
+
pequeños gestos neo-medievales
```

sin sacrificar velocidad, claridad ni mantenibilidad.

La prueba final es sencilla:

> Si quitamos el nombre “Día de Gachas”, la pantalla debería seguir pareciendo de Día de Gachas.
