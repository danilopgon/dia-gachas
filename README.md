# 🌥️ Día de Gachas

**¿Hace día de gachas?**  
Una aplicación que conecta con la API de la AEMET para determinar si el tiempo invita a cocinar uno de los platos más populares de la gastronomía manchega.

> Si hace frío, viento o llueve... la respuesta está clara: ¡Hoy es día de gachas!

<img width="1920" height="1080" alt="Landing de Día de Gachas" src="https://github.com/user-attachments/assets/9cbe0a6e-560b-462a-b36c-2f2449e4f7a2" />


---

## 🧠 ¿Qué es esto?

Día de Gachas es una app ligera que consulta datos meteorológicos en tiempo real y los interpreta con una lógica sencilla pero emocional:  
**¿Hace gachas o no? La única medida necesaria en la vida.**

El resultado se muestra en una interfaz cuidada, accesible y responsive. Ideal para consultarlo cada mañana o antes de ir a por harina de almortas.

---

## 🛠 Stack técnico

- **Frontend**: Angular 19 (PWA) · Tailwind CSS v4 · PrimeNG · GSAP
- **Backend**: NestJS 11
- **Municipios**: catálogo estático en `frontend/public/data/municipios.json`
- **Datos meteorológicos**: API oficial de AEMET

---

## 🚀 Cómo levantar el proyecto

1. **Clona el repo**

   ```bash
   git clone https://github.com/danilopgon/dia-gachas.git
   cd dia-gachas
   ```

2. **Instala las dependencias de todos los paquetes**

   El repo es un workspace de pnpm (versión fijada en `packageManager`). Con Node 22 basta con activar Corepack:

   ```bash
   corepack enable
   pnpm install
   ```

3. **Configura las variables de entorno**

   Copia la plantilla y rellena tus valores:

   ```bash
   cp backend/.env.dist backend/.env
   ```

   ```env
   AEMET_API_KEY=tu_clave_de_aemet
   CORS_ORIGIN=http://localhost:4200
   ```

   Consigue tu clave de AEMET en [opendata.aemet.es](https://opendata.aemet.es).

4. **Levanta el entorno en desarrollo**

   ```bash
   pnpm dev
   ```

   Esto ejecutará backend y frontend en paralelo:
   - Backend: http://localhost:4000
   - Frontend: http://localhost:4200

---

## 📦 Estructura del proyecto

```
dia-de-gachas/
│
├── frontend/     → Aplicación Angular
├── backend/      → API en NestJS
```
---

## ⚙️ Comandos útiles

```bash
pnpm test:api      # Tests del backend
pnpm test:web      # Tests del frontend
pnpm build         # Build completo (api + web)
pnpm lint          # Lint de ambos paquetes (sin modificar ficheros)
pnpm lint:fix      # Lint con correcciones automáticas
```

---

## 🤔 ¿Por qué esto?

Porque en Castilla-La Mancha no necesitamos una app del tiempo.  
Necesitamos saber si toca mojar pan.

---

## 🧂 Créditos

Proyecto creado por [Dani López](https://github.com/danilopgon), desarrollador frontend amante del buen comer y el código limpio.

---
