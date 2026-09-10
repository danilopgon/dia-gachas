# 70 · Dirección visual — Future Medieval Manchego

> Fuente: Dirección de diseño §D1–§D5, §D27. Índice general en [`../README.md`](../README.md).
>
> Documento de dirección visual para la modernización de **Día de Gachas**.
>
> Estado: propuesta objetivo para la rama de migración.
>
> Este documento redefine la dirección visual del frontend. **Sustituye la intención de “mantener la estética actual”** descrita en `frontend/16-ui-veredicto-y-share.md` y debe terminar reemplazando la parte visual de `frontend/.impeccable.md`. Las decisiones funcionales de esos documentos —score, razones del veredicto, share, accesibilidad, etc.— siguen vigentes.
>
> En este repositorio ese documento es
> [`../frontend/16-ui-veredicto-y-share.md`](../frontend/16-ui-veredicto-y-share.md), y la
> intención sustituida es concretamente su §53.

---

## §D1 · Contexto

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

## §D2 · Concepto rector

### Future Medieval Manchego / Vernacular Editorial

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

## §D3 · Personalidad

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

## §D4 · Principio anti-AI-slop

Cada decisión visual debe superar esta pregunta:

> ¿Podría esta pantalla aparecer casi igual en una landing generada automáticamente para una startup cualquiera?

Si la respuesta es sí, la decisión necesita más identidad.

### Evitar explícitamente

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

### Regla de proporción

La interfaz objetivo debe sentirse aproximadamente:

```text
80 % editorial funcional
15 % ilustración / dither / textura
 5 % medieval explícito
```

El 5 % medieval es importante: si sube demasiado, el producto se convierte en cosplay.

---

## §D5 · Qué conservamos del diseño actual

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

### Qué cambia de las ilustraciones actuales

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

## §D27 · Resumen ejecutivo

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

---

## Documentos relacionados

- Tokens y sistema de diseño: [`71-sistema-de-tokens.md`](./71-sistema-de-tokens.md)
- Composición editorial: [`72-composicion-y-layout.md`](./72-composicion-y-layout.md)
- Cómo se implanta dentro de la migración: [`77-implantacion.md`](./77-implantacion.md)
- Reglas para agentes que tocan UI: [`78-reglas-agentes-ui.md`](./78-reglas-agentes-ui.md)
- Lo que el proyecto no introduce (versión funcional): [`../00-vision-y-alcance.md`](../00-vision-y-alcance.md) §74
