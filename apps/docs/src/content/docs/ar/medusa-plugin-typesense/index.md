---
title: "بحث Typesense والبحث الهجين بالذكاء الاصطناعي"
description: "فهرسة Typesense والبحث الهجين/المتجهي بالذكاء الاصطناعي وإدارة المرادفات والترتيب المخصص وحزمة InstantSearch للواجهة."
---

فهرسة Typesense والبحث الهجين/المتجهي بالذكاء الاصطناعي وإدارة المرادفات والترتيب المخصص وحزمة InstantSearch للواجهة.

## التثبيت السريع

```bash
pnpm add @vicacha-devs/medusa-plugin-typesense
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-typesense",
      options: {},
    },
  ],
});
```

## الوثائق الكاملة

- [Overview (EN)](/medusa-plugin-typesense/)
- [Data Models & Use Cases](/medusa-plugin-typesense/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-typesense/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-typesense/api/) (35 endpoints)
