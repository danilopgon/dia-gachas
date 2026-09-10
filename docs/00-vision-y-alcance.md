# 00 · Visión y alcance

> Fuente: BRS §1, §2, §74. Índice general en [`docs/README.md`](./README.md).

---

## §1 · Propósito

Este documento define la modernización completa de **Día de Gachas**.

El proyecto combinará tres líneas de trabajo relacionadas:

1. **Modernización frontend**
   - Angular 19 → Angular 22.
   - adopción selectiva de APIs modernas del framework;
   - Zoneless;
   - OnPush;
   - `httpResource`;
   - modernización del modelo reactivo;
   - migración de Jest a Vitest cuando resulte razonable.

2. **Retirada completa de PrimeNG**
   - no adoptar PrimeNG 22;
   - sustituir componentes PrimeNG por HTML nativo, Tailwind CSS y primitives oficiales de Angular;
   - eliminar también PrimeIcons, themes PrimeNG y cualquier integración específica de PrimeUI.

3. **Migración backend**
   - NestJS/Prisma → ASP.NET Core/EF Core;
   - Clean Architecture;
   - CQRS;
   - módulos funcionales;
   - integración AEMET aislada;
   - testing;
   - despliegue containerizado en Coolify.

Además, la migración incorporará una pequeña mejora funcional:

> La aplicación no solo dirá si hace día de gachas, sino que explicará **por qué**.

El objetivo profesional es que el proyecto pueda demostrar una modernización full-stack real:

```text
Angular 19 + PrimeNG + NestJS + Prisma
                    ↓
       modernización incremental
                    ↓
Angular 22 + Angular primitives + ASP.NET Core + EF Core
```

---

## §2 · Principio rector

Día de Gachas seguirá siendo una aplicación pequeña.

La arquitectura puede ser seria.

El producto no debe convertirse en un ERP manchego.

La regla será:

> Añadir sofisticación cuando demuestre ingeniería, mejore mantenibilidad, fiabilidad, accesibilidad o producto.

No:

> Añadir patrones porque existen.

---

## §74 · Cosas que no vamos a introducir

Frontend:

```text
otra mega component library
NgRx
Redux
microfrontends
custom framework
experimental APIs porque sí
```

Backend:

```text
microservices
Kafka
RabbitMQ
Redis
event sourcing
Kubernetes
DDD ceremonial
generic repository
custom UnitOfWork
```

Producto:

```text
users
auth
social
favoritos
ML predictor de gachas
```

---

## Documentos relacionados

- Estado actual del código: [`01-estado-actual.md`](./01-estado-actual.md)
- Definition of Done: [`agents/53-definition-of-done.md`](./agents/53-definition-of-done.md)
- Narrativa final y valor del proyecto: [`referencia/61-narrativa-y-valor.md`](./referencia/61-narrativa-y-valor.md)
- La versión **visual** de esta lista (el filtro anti-AI-slop):
  [`diseno/70-direccion-visual.md`](./diseno/70-direccion-visual.md) §D4
