---
title: "Facturación Electrónica Global"
description: "Plugin de facturación electrónica agnóstico al país para Medusa v2 con drivers conectables (EU Peppol EN 16931, Colombia DIAN, México CFDI 4.0, UBL 2.1) y puentes B2B/Documents."
---

Plugin de facturación electrónica agnóstico al país para Medusa v2 con drivers conectables (EU Peppol EN 16931, Colombia DIAN, México CFDI 4.0, UBL 2.1) y puentes B2B/Documents.

## Instalación Rápida

```bash
pnpm add @vicacha-devs/medusa-plugin-einvoicing
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-einvoicing",
      options: {},
    },
  ],
})
```

## Documentación Completa

- [Overview (EN)](/medusa-plugin-einvoicing/)
- [Data Models & Use Cases](/medusa-plugin-einvoicing/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-einvoicing/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-einvoicing/api/) (5 endpoints)
