---
title: "الفوترة الإلكترونية DIAN"
description: "الفوترة الإلكترونية الكولومبية DIAN UBL 2.1 مع توقيع XAdES-EPES وحساب CUFE/CUDE وخدمات SOAP ومزودين قابلين للتوصيل."
---

الفوترة الإلكترونية الكولومبية DIAN UBL 2.1 مع توقيع XAdES-EPES وحساب CUFE/CUDE وخدمات SOAP ومزودين قابلين للتوصيل.

## التثبيت السريع

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

## الوثائق الكاملة

- [Overview (EN)](/medusa-plugin-dian/)
- [Data Models & Use Cases](/medusa-plugin-dian/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-dian/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-dian/api/) (13 endpoints)
