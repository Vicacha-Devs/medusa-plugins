---
title: "Pagos Mollie y B2B Net-14"
description: "Proveedor de pagos Mollie (iDEAL, Bancontact, SEPA, Tarjetas) y facturación B2B Net-14 para Medusa v2."
---

Proveedor de pagos Mollie (iDEAL, Bancontact, SEPA, Tarjetas) y facturación B2B Net-14 para Medusa v2.

## Instalación Rápida

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

## Documentación Completa

- [Overview (EN)](/medusa-payment-mollie/)
- [Data Models & Use Cases](/medusa-payment-mollie/use-cases/)
- [Developer Guide & Admin UI](/medusa-payment-mollie/guide/)
