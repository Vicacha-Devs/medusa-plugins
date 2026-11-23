---
title: "Facturación Electrónica DIAN"
description: "Facturación electrónica DIAN Colombia UBL 2.1 (Resolución 000165), CUFE/CUDE SHA-384, firma XAdES-EPES, servicios SOAP y proveedores conectables."
---

Facturación electrónica DIAN Colombia UBL 2.1 (Resolución 000165), CUFE/CUDE SHA-384, firma XAdES-EPES, servicios SOAP y proveedores conectables.

## Instalación Rápida

```bash
pnpm add @vicacha-devs/medusa-plugin-dian
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-dian",
      options: {},
    },
  ],
})
```

## Documentación Completa

- [Overview (EN)](/medusa-plugin-dian/)
- [Data Models & Use Cases](/medusa-plugin-dian/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-dian/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-dian/api/) (13 endpoints)
