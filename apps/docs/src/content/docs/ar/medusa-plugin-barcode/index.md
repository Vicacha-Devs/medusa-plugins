---
title: "الباركود وGS1 وجرد المستودعات"
description: "حزمة 4 في 1 للباركود وتوليد GS1/QR والبحث عن GTIN وطباعة الملصقات الحرارية ZPL II والتحقق من الأصالة وجرد المستودعات."
---

حزمة 4 في 1 للباركود وتوليد GS1/QR والبحث عن GTIN وطباعة الملصقات الحرارية ZPL II والتحقق من الأصالة وجرد المستودعات.

## التثبيت السريع

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

## الوثائق الكاملة

- [Overview (EN)](/medusa-plugin-barcode/)
- [Data Models & Use Cases](/medusa-plugin-barcode/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-barcode/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-barcode/api/) (29 endpoints)
