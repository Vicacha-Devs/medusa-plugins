---
title: "Bold Kolombiya Ödemeleri"
description: "Ödeme düğmesi, link, çevrimiçi API (Kart/PSE/Nequi/QR) ve Smart POS terminalleri için 4 kanallı Bold Kolombiya ödeme paketi."
---

Ödeme düğmesi, link, çevrimiçi API (Kart/PSE/Nequi/QR) ve Smart POS terminalleri için 4 kanallı Bold Kolombiya ödeme paketi.

## Hızlı Kurulum

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

## Tam Dokümantasyon

- [Overview (EN)](/medusa-payment-bold/)
- [Data Models & Use Cases](/medusa-payment-bold/use-cases/)
- [Developer Guide & Admin UI](/medusa-payment-bold/guide/)
- [Interactive OpenAPI Reference](/medusa-payment-bold/api/) (14 endpoints)
