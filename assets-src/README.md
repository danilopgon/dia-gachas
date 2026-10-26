# Día de Gachas — prueba de fondos ilustrados

Los PNG de esta carpeta son las **fuentes maestras**:

- `home-mobile.png`: ilustración vertical con textura de papel y tinta.
- `home-desktop-master.png`: panorámica 16:9 con la misma estética.

El generador no redibuja la ilustración en SVG: conserva sus píxeles y su
granulado. De la panorámica extrae tres capas con máscaras por color y
transparencia: **cielo**, **colinas** y **campos de primer plano**. Todas
comparten un lienzo de 2912 × 1632, por lo que encajan al superponerlas.
El sol mantiene por ahora el asset original de la aplicación.

## Pipeline

Desde la raíz del monorepo:

1. `pnpm assets:build` comprime el móvil y recorta las tres capas de escritorio
   en WebP. También genera `manifest.json` con sus hashes.
2. `pnpm assets:check` valida dimensiones, canal alfa y correspondencia con
   los maestros y los scripts. CI ejecuta esta comprobación.
3. `pnpm assets:preview` regenera la composición y dos imágenes de prueba
   de movimiento para inspeccionar las máscaras antes de aprobar el cambio.

Los WebP se guardan en `frontend/public/assets/images/experimental/`. No se
sobrescriben los fondos originales.

## Límite de las capas

Las zonas que estaban ocultas tras las colinas o campos no existen en la
ilustración original. El script extiende píxeles y textura detrás de ellos,
de forma suficiente para la **entrada suave y sincronizada** actual de GSAP.
El fotograma final reproduce prácticamente al píxel la panorámica maestra.
Desplazamientos independientes grandes pueden revelar repetición de texturas:
para un parallax profundo haría falta generar pintura adicional real detrás
de cada silueta.

## Iconos del tiempo

`weather-icons-v2/` contiene los cinco PNG de alta resolución (sol, nubes,
lluvia, tormenta y nieve). Sus versiones WebP de 400 × 400 con transparencia
se generan por separado:

1. `pnpm assets:icons:build`: exporta los iconos y sus hashes.
2. `pnpm assets:icons:check`: valida formato, tamaño, transparencia y fuentes.
3. `pnpm assets:icons:preview`: crea además una comparación visual a 160 y 80 px.

La pantalla de resultados utiliza ahora los iconos nuevos de
`frontend/public/assets/icons/experimental/`, sin eliminar los anteriores.
El fondo de la página de resultados sigue siendo el original.
