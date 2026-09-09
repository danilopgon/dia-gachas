# 61 · Narrativa técnica final, valor y regla final

> Fuente: BRS §75, §76, §80. Índice general en [`../README.md`](../README.md).

---

## §75 · Narrativa técnica final

Al terminar, la descripción del proyecto será aproximadamente:

> Día de Gachas es una PWA construida con Angular 22 y ASP.NET Core 10 que integra AEMET para evaluar si las condiciones meteorológicas son adecuadas para comer gachas. El frontend fue modernizado desde Angular 19, eliminando su dependencia de PrimeNG en favor de Angular ARIA, CDK, HTML nativo y Tailwind; utiliza Signals, httpResource, Zoneless y OnPush. El backend fue migrado progresivamente desde NestJS/Prisma a una arquitectura modular Clean con CQRS, MediatR, EF Core/MySQL, caching, rate limiting y una integración tipada con AEMET.

Y la historia de migración:

```text
Angular 19
PrimeNG
NestJS
Prisma
    ↓
strangler migration
    ↓
Angular 22
Angular ARIA / CDK
ASP.NET Core
EF Core
```

---

## §76 · Valor para entrevista

### Angular

Permite explicar:

- tres major upgrades;
- eliminación de component library;
- accesibilidad de combobox;
- Angular ARIA;
- CDK Overlay;
- Signals;
- httpResource;
- Zoneless;
- OnPush;
- testing moderno.

### .NET

Permite explicar:

- ASP.NET Core;
- CQRS;
- MediatR;
- EF Core;
- Clean Architecture;
- integration patterns;
- caching;
- testing.

### Arquitectura

Permite explicar:

- strangler migration;
- contract parity;
- schema ownership;
- reversible cutover;
- dependency reduction;
- incremental refactoring.

### Producto

Permite explicar:

- extracción de reglas implícitas a dominio;
- explicabilidad;
- mejora funcional pequeña;
- scope control.

---

## §80 · Regla final

La arquitectura final debe parecer más profesional que la inicial.

La aplicación debe parecer igual de absurda.

Éxito:

> “Han migrado Angular, eliminado una UI library, construido un autocomplete accesible, migrado Nest a .NET y modelado el dominio... para saber si toca comer gachas.”

Exactamente esa energía.

---

## Documentos relacionados

- Propósito y principio rector: [`../00-vision-y-alcance.md`](../00-vision-y-alcance.md)
- Definition of Done: [`../agents/53-definition-of-done.md`](../agents/53-definition-of-done.md)
