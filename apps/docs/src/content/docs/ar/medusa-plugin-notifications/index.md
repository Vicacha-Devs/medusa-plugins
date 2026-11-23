---
title: "الإشعارات متعددة القنوات"
description: "استوديو إشعارات متعدد القنوات لـ Medusa v2 مع منشئ قوالب وسجل موافقات واسترداد السلال المتروكة والبث الجماعي."
---

استوديو إشعارات متعدد القنوات لـ Medusa v2 مع منشئ قوالب وسجل موافقات واسترداد السلال المتروكة والبث الجماعي.

## التثبيت السريع

```bash
pnpm add @vicacha-devs/medusa-plugin-notifications
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-notifications",
      options: {},
    },
  ],
})
```

## الوثائق الكاملة

- [Overview (EN)](/medusa-plugin-notifications/)
- [Data Models & Use Cases](/medusa-plugin-notifications/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-notifications/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-notifications/api/) (22 endpoints)
