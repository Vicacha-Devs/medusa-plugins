---
title: "Mollie ve B2B Net-14 Ödemeleri"
description: "Medusa v2 için Mollie (iDEAL, Bancontact, SEPA, Kartlar) ve B2B Net-14 fatura ödeme sağlayıcısı."
---

Medusa v2 için Mollie (iDEAL, Bancontact, SEPA, Kartlar) ve B2B Net-14 fatura ödeme sağlayıcısı.

## Hızlı Kurulum

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

## Tam Dokümantasyon

- [Overview (EN)](/medusa-payment-mollie/)
- [Data Models & Use Cases](/medusa-payment-mollie/use-cases/)
- [Developer Guide & Admin UI](/medusa-payment-mollie/guide/)
