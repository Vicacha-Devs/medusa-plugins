---
title: "Documentos PDF Comerciales"
description: "Facturas, listas de empaque, notas crédito y recibos POS con motor PDF dual, i18n en 10 idiomas y firmas electrónicas Docuseal."
---

Facturas, listas de empaque, notas crédito y recibos POS con motor PDF dual, i18n en 10 idiomas y firmas electrónicas Docuseal.

## Instalación Rápida

```bash
pnpm add @vicacha-devs/medusa-plugin-documents
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-documents",
      options: {},
    },
  ],
});
```

## Documentación Completa

- [Overview (EN)](/medusa-plugin-documents/)
- [Data Models & Use Cases](/medusa-plugin-documents/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-documents/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-documents/api/) (31 endpoints)
