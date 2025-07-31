# 🌥️ Día de Gachas

**¿Hace día de gachas?**  
Una aplicación que conecta con la API de la AEMET para determinar si el tiempo invita a cocinar uno de los platos más populares de la gastronomía manchega.

> Si hace frío, viento o llueve... la respuesta está clara: ¡Hoy es día de gachas!

---

## 🧠 ¿Qué es esto?

Día de Gachas es una app ligera que consulta datos meteorológicos en tiempo real y los interpreta con una lógica sencilla pero emocional:  
**¿Hace gachas o no? La única medida necesaria en la vida.**

El resultado se muestra en una interfaz cuidada, accesible y responsive. Ideal para consultarlo cada mañana o antes de ir a por harina de almortas.

---

## 🛠 Stack técnico

- **Frontend**: Angular (con SSR y PWA)
- **Backend**: NestJS + Prisma
- **Datos meteorológicos**: API oficial de AEMET

---

## 🚀 Cómo levantar el proyecto

1. **Clona el repo**

   ```bash
   git clone https://github.com/tu-usuario/dia-de-gachas.git
   cd dia-de-gachas
   ```

2. **Instala las dependencias de todos los paquetes**

   ```bash
   npm run install:all
   ```

3. **Configura la clave de AEMET**
   Crea un archivo `.env` en la carpeta `backend/`:

   ```
   AEMET_API_KEY=tu_clave
   ```

4. **Levanta el entorno en desarrollo**

   ```bash
   npm run dev
   ```

   Esto ejecutará tanto el backend (`NestJS`) como el frontend (`Angular`) en paralelo.

---

## 📦 Estructura del proyecto

```
dia-de-gachas/
│
├── frontend/     → Aplicación Angular
├── backend/      → API en NestJS + Prisma
├── package.json  → Scripts y workspaces raíz
└── README.md
```

---

## ✅ Estado actual

- [x] Backend funcional con lógica meteorológica
- [x] Prototipo de interfaz diseñado
- [ ] Desarrollo frontend en curso
- [ ] Animaciones y estados visuales
- [ ] Versión demo pública

---

## 🤔 ¿Por qué esto?

Porque en Castilla-La Mancha no necesitamos una app del tiempo.  
Necesitamos saber si toca mojar pan.

---

## 📸 Screenshots (próximamente)

_(En cuanto esté lista la interfaz definitiva y la demo visual)_

---

## 🧂 Créditos

Proyecto creado por [Dani López](https://github.com/danilopgon), desarrollador frontend amante del buen comer y el código limpio.

---
