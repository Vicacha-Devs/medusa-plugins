---
title: "Odoo ERP Çift Yönlü Senkronizasyon"
description: "Ürünler, çoklu depo stok mutabakatı, siparişler, faturalar ve çevrimdışı POS tekrarı için çift yönlü Odoo ERP entegrasyonu."
---

Ürünler, çoklu depo stok mutabakatı, siparişler, faturalar ve çevrimdışı POS tekrarı için çift yönlü Odoo ERP entegrasyonu.

## Hızlı Kurulum

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

## Tam Dokümantasyon

- [Overview (EN)](/medusa-plugin-odoo/)
- [Data Models & Use Cases](/medusa-plugin-odoo/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-odoo/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-odoo/api/) (23 endpoints)
