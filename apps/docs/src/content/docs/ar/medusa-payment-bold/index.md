---
title: "مدفوعات Bold كولومبيا"
description: "بوابة مدفوعات Bold كولومبيا عبر 4 قنوات (زر الدفع والروابط والواجهة المباشرة وأجهزة Smart POS) مع محاكي اختبار محلي."
---

بوابة مدفوعات Bold كولومبيا عبر 4 قنوات (زر الدفع والروابط والواجهة المباشرة وأجهزة Smart POS) مع محاكي اختبار محلي.

## التثبيت السريع

```bash
pnpm add @vicacha-devs/medusa-payment-bold
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-payment-bold",
      options: {},
    },
  ],
})
```

## الوثائق الكاملة

- [Overview (EN)](/medusa-payment-bold/)
- [Data Models & Use Cases](/medusa-payment-bold/use-cases/)
- [Developer Guide & Admin UI](/medusa-payment-bold/guide/)
- [Interactive OpenAPI Reference](/medusa-payment-bold/api/) (14 endpoints)
