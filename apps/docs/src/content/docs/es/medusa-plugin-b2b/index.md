---
title: "B2B Empresas y Cotizaciones"
description: "Empresas B2B, jerarquías de empleados, reglas de aprobación, límites de gasto y flujos de negociación de cotizaciones para Medusa v2."
---

Empresas B2B, jerarquías de empleados, reglas de aprobación, límites de gasto y flujos de negociación de cotizaciones para Medusa v2.

## Instalación Rápida

```bash
pnpm add @vicacha-devs/medusa-plugin-b2b
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-b2b",
      options: {},
    },
  ],
});
```

## Documentación Completa

- [Overview (EN)](/medusa-plugin-b2b/)
- [Data Models & Use Cases](/medusa-plugin-b2b/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-b2b/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-b2b/api/) (49 endpoints)
