---
title: "Barkod, GS1 ve Stok Sayımı"
description: "Medusa v2 için barkod/GS1/QR üretimi, çoklu sağlayıcı GTIN sorgulama, termal ZPL II etiket yazdırma ve depo stok sayımı."
---

Medusa v2 için barkod/GS1/QR üretimi, çoklu sağlayıcı GTIN sorgulama, termal ZPL II etiket yazdırma ve depo stok sayımı.

## Hızlı Kurulum

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
});
```

## Tam Dokümantasyon

- [Overview (EN)](/medusa-plugin-barcode/)
- [Data Models & Use Cases](/medusa-plugin-barcode/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-barcode/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-barcode/api/) (29 endpoints)
