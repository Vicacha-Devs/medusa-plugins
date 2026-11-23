---
title: "Códigos de Barras, GS1 e Inventario"
description: "Suite 4-en-1 de códigos de barras, generación GS1/QR, búsqueda GTIN multiproveedor, impresión térmica ZPL II, verificación antifalsificación y conteo de inventario."
---

Suite 4-en-1 de códigos de barras, generación GS1/QR, búsqueda GTIN multiproveedor, impresión térmica ZPL II, verificación antifalsificación y conteo de inventario.

## Instalación Rápida

```bash
pnpm add @vicacha-devs/medusa-plugin-barcode
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-barcode",
      options: {},
    },
  ],
})
```

## Documentación Completa

- [Overview (EN)](/medusa-plugin-barcode/)
- [Data Models & Use Cases](/medusa-plugin-barcode/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-barcode/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-barcode/api/) (29 endpoints)
