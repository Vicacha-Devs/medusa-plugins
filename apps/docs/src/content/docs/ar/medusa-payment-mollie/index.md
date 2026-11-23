---
title: "مدفوعات Mollie وNet-14"
description: "مزود دفع Mollie (iDEAL وBancontact وSEPA والبطاقات) وفواتير B2B Net-14 لنظام Medusa v2."
---

مزود دفع Mollie (iDEAL وBancontact وSEPA والبطاقات) وفواتير B2B Net-14 لنظام Medusa v2.

## التثبيت السريع

```bash
pnpm add @vicacha-devs/medusa-payment-mollie
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-payment-mollie",
      options: {},
    },
  ],
})
```

## الوثائق الكاملة

- [Overview (EN)](/medusa-payment-mollie/)
- [Data Models & Use Cases](/medusa-payment-mollie/use-cases/)
- [Developer Guide & Admin UI](/medusa-payment-mollie/guide/)
