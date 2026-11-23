---
title: "Mollie & B2B Net-14"
description: "Mollie (iDEAL, Bancontact, SEPA, Cards) and B2B Net-14 Invoice payment provider plugin for Medusa v2."
---

> **Package:** `@vicacha-devs/medusa-payment-mollie` · **Version:** `0.0.1` · **Category:** Payments

## Package Snapshot

| Capability                | Details                                            |
| :------------------------ | :------------------------------------------------- |
| Medusa Modules / Models   | 0 modules / 0 data models                          |
| Workflows                 | 0                                                  |
| Subscribers / Jobs        | 0 subscribers / 0 scheduled jobs                   |
| Providers                 | mollie-payment                                     |
| Admin UI Routes / Widgets | 0 routes / 0 widgets                               |
| Admin i18n Locales        | en                                                 |
| HTTP Endpoints            | Provider / Middleware-only (no custom HTTP routes) |

Mollie (iDEAL, Bancontact, SEPA, Cards) and B2B Net-14 Invoice payment provider plugin for Medusa v2.

## Installation

```bash
pnpm add @vicacha-devs/medusa-payment-mollie
```

Register the plugin in `medusa-config.ts`:

```ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-payment-mollie",
      options: {},
    },
  ],
})
```
