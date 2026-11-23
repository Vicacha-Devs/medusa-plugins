---
title: "مزامنة Odoo ERP ثنائية الاتجاه"
description: "مزامنة ثنائية الاتجاه مع Odoo 14–19+ للمنتجات والمخزون متعدد المستودعات والطلبات والفواتير ونقاط البيع."
---

مزامنة ثنائية الاتجاه مع Odoo 14–19+ للمنتجات والمخزون متعدد المستودعات والطلبات والفواتير ونقاط البيع.

## التثبيت السريع

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
})
```

## الوثائق الكاملة

- [Overview (EN)](/medusa-plugin-odoo/)
- [Data Models & Use Cases](/medusa-plugin-odoo/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-odoo/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-odoo/api/) (23 endpoints)
