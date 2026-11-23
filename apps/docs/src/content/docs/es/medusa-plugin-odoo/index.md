---
title: "Sincronización Odoo ERP"
description: "Sincronización bidireccional con Odoo 14–19+ para productos, conciliación de inventario multialmacén, pedidos, facturas y POS offline."
---

Sincronización bidireccional con Odoo 14–19+ para productos, conciliación de inventario multialmacén, pedidos, facturas y POS offline.

## Instalación Rápida

```bash
pnpm add @vicacha-devs/medusa-plugin-odoo
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-odoo",
      options: {},
    },
  ],
});
```

## Documentación Completa

- [Overview (EN)](/medusa-plugin-odoo/)
- [Data Models & Use Cases](/medusa-plugin-odoo/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-odoo/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-odoo/api/) (23 endpoints)
