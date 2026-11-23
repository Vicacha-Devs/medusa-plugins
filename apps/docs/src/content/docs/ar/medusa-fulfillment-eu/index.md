---
title: "الشحن الأوروبي وبينيلوكس"
description: "مزود شحن لأوروبا وبينيلوكس لـ Medusa v2 يدعم PostNL وSendcloud EU وشحن المنصات LCL في روتردام."
---

مزود شحن لأوروبا وبينيلوكس لـ Medusa v2 يدعم PostNL وSendcloud EU وشحن المنصات LCL في روتردام.

## التثبيت السريع

```bash
pnpm add @vicacha-devs/medusa-fulfillment-eu
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-fulfillment-eu",
      options: {},
    },
  ],
});
```

## الوثائق الكاملة

- [Overview (EN)](/medusa-fulfillment-eu/)
- [Data Models & Use Cases](/medusa-fulfillment-eu/use-cases/)
- [Developer Guide & Admin UI](/medusa-fulfillment-eu/guide/)

