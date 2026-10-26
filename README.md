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
- **Backend**: NestJS 11 en Railway
- **Ingesta**: comando NestJS ejecutado por Railway Cron; snapshots en un Railway Bucket (S3, `@aws-sdk/client-s3`)
- **Municipios**: catálogo estático en `frontend/public/data/municipios.json`
- **Datos meteorológicos**: API oficial de AEMET (endpoint agregado de todos los municipios)

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

## 🧭 Arquitectura

```text
                     build time
repo localidades-provincias-aemet ──▶ scripts/municipios ──▶ frontend/public/data/municipios.json

                     cada 3 h (Railway Cron, 10 */3 * * * UTC)
AEMET /municipio/diaria/todos (tar.gz) ──▶ ingesta NestJS ──▶ Railway Bucket
                                            · nombres del catálogo      snapshots/<fecha>.json.gz
                                            · valida cobertura ≥ 99 %   latest.json (solo avanza)

                     runtime
Angular PWA (Vercel) ──▶ búsqueda local en municipios.json
                    └──▶ GET /weather/:code ──▶ NestJS (Railway)
```

Ahora mismo la API sigue consultando AEMET por cada municipio. Leer el último snapshot del bucket es el siguiente paso de la migración (issue #22).

Si la ingesta falla (AEMET caído, `429`, datos incompletos), `latest.json` no cambia: se sigue sirviendo el último snapshot válido.

---

## 📦 Estructura del proyecto

```
dia-de-gachas/
│
├── frontend/     → Aplicación Angular
├── backend/      → API e ingesta en NestJS
├── scripts/      → Generador del catálogo de municipios
```
---

## ⚙️ Comandos útiles

```bash
pnpm test:api      # Tests del backend
pnpm test:web      # Tests del frontend
pnpm build         # Build completo (api + web)
pnpm lint          # Lint de ambos paquetes (sin modificar ficheros)
pnpm lint:fix      # Lint con correcciones automáticas
pnpm --filter dia-gachas-api ingest   # Ingesta manual (tras `pnpm build`; necesita las variables del bucket)
```

---

## ☁️ Despliegue

- **Frontend**: Vercel, configurado desde el panel del proyecto (Root Directory `frontend`).
- **Railway**: proyecto `dia-gachas`, configurado desde el panel de cada servicio. Los dos servicios usan la imagen `backend/Dockerfile`, construida desde la raíz del repo, y solo se despliegan cuando cambian `backend/**`, `frontend/public/data/municipios.json` o los ficheros del workspace.
  - **`api`**: `node dist/main`, healthcheck `GET /health`.
  - **`ingest`**: cron `10 */3 * * *` (UTC) con `node dist/ingest`. Termina con código 0 si publica o si ya había un snapshot más reciente, y con código 1 en cualquier otro caso.
  - **Bucket `snapshots`**: guarda los snapshots durante 7 días.
- **Variables de la API**: `AEMET_API_KEY` y `CORS_ORIGIN` (orígenes separados por comas). `PORT` la pone Railway; en local se usa `4000`. La API no arranca si falta alguna obligatoria.
- **Variables de la ingesta**: `AEMET_API_KEY` y las del bucket (`BUCKET`, `ENDPOINT`, `REGION`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`), como referencias de Railway. `MUNICIPIOS_PATH` es `/app/data/municipios.json` dentro de la imagen.

---

## 🤔 ¿Por qué esto?

Porque en Castilla-La Mancha no necesitamos una app del tiempo.  
Necesitamos saber si toca mojar pan.

---

## 🧂 Créditos

Proyecto creado por [Dani López](https://github.com/danilopgon), desarrollador frontend amante del buen comer y el código limpio.

---
