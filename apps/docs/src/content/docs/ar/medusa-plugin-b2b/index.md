---
title: "تجارة B2B والشركات وعروض الأسعار"
description: "إدارة شركات B2B وتسلسل الموظفين وقواعد الموافقة وحدود الإنفاق ومسارات التفاوض على عروض الأسعار لنظام Medusa v2."
---

إدارة شركات B2B وتسلسل الموظفين وقواعد الموافقة وحدود الإنفاق ومسارات التفاوض على عروض الأسعار لنظام Medusa v2.

## التثبيت السريع

```bash
pnpm add @vicacha-devs/medusa-plugin-b2b
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-b2b",
      options: {},
    },
  ],
});
```

## الوثائق الكاملة

- [Overview (EN)](/medusa-plugin-b2b/)
- [Data Models & Use Cases](/medusa-plugin-b2b/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-b2b/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-b2b/api/) (49 endpoints)
