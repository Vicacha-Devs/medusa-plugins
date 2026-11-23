---
title: "الأتمتة ومحرك القواعد"
description: "محرك أتمتة قائم على القواعد (مشغل ← شرط ← إجراء) لنظام Medusa v2 مع تقييم شروط متداخلة وإجراءات الإشعارات وWebhook."
---

محرك أتمتة قائم على القواعد (مشغل ← شرط ← إجراء) لنظام Medusa v2 مع تقييم شروط متداخلة وإجراءات الإشعارات وWebhook.

## التثبيت السريع

```bash
pnpm add @vicacha-devs/medusa-plugin-automations
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-automations",
      options: {},
    },
  ],
})
```

## الوثائق الكاملة

- [Overview (EN)](/medusa-plugin-automations/)
- [Data Models & Use Cases](/medusa-plugin-automations/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-automations/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-automations/api/) (8 endpoints)
