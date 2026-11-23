---
title: "الفوترة الإلكترونية العالمية"
description: "إضافة فوترة إلكترونية متعددة الدول لنظام Medusa v2 مع محركات قابلة للتوصيل (Peppol الأوروبي وDIAN كولومبيا وCFDI المكسيك) وتكامل اختياري مع B2B والمستندات."
---

إضافة فوترة إلكترونية متعددة الدول لنظام Medusa v2 مع محركات قابلة للتوصيل (Peppol الأوروبي وDIAN كولومبيا وCFDI المكسيك) وتكامل اختياري مع B2B والمستندات.

## التثبيت السريع

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

## الوثائق الكاملة

- [Overview (EN)](/medusa-plugin-einvoicing/)
- [Data Models & Use Cases](/medusa-plugin-einvoicing/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-einvoicing/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-einvoicing/api/) (5 endpoints)
