---
title: "Automatizaciones y Reglas"
description: "Motor de automatización basado en reglas (disparador → condición → acción) para Medusa v2 con evaluación anidada y acciones de Notificación y Webhook."
---

Motor de automatización basado en reglas (disparador → condición → acción) para Medusa v2 con evaluación anidada y acciones de Notificación y Webhook.

## Instalación Rápida

```bash
pnpm add @vicacha-devs/medusa-plugin-automations
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-automations",
      options: {},
    },
  ],
})
```

## Documentación Completa

- [Overview (EN)](/medusa-plugin-automations/)
- [Data Models & Use Cases](/medusa-plugin-automations/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-automations/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-automations/api/) (8 endpoints)
