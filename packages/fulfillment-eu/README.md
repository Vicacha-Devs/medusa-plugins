# `@vicacha-devs/medusa-fulfillment-eu`

EU & Benelux fulfillment provider plugin for **Medusa v2**, supporting **PostNL Letterbox**, **Sendcloud EU Parcel**, and **Rotterdam LCL Pallet Freight** with configurable free-shipping thresholds by region and weight.

---

## Key Features

- **3 Built-in Fulfillment Options**:
  - `postnl-letterbox`: Low-cost letterbox parcel for lightweight shipments (`<= letterboxMaxGrams`).
  - `sendcloud-eu-parcel`: Standard Benelux (`NL`, `BE`, `LU`) and pan-EU parcel delivery.
  - `rotterdam-lcl-pallet`: Palletized LCL freight for heavy orders (`>= palletWeightGrams`) or bulk (`isGreenBulk`) shipments.
- **Smart Rate & Free-Shipping Calculator**: `calculateEuShippingQuote()` evaluates Benelux vs. EU thresholds, weight qualification (`freeWeightGrams`), and remaining amount needed for free shipping.
- **SSRF-Safe & Offline Tested**: Pure TypeScript fulfillment provider (`AbstractFulfillmentProviderService`) with unit tests.

---

## Installation & Configuration

```bash
pnpm add @vicacha-devs/medusa-fulfillment-eu
```

Register the fulfillment module provider in `medusa-config.ts`:

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-fulfillment-eu",
      options: {},
    },
  ],
  modules: [
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve:
              "@vicacha-devs/medusa-fulfillment-eu/providers/eu-fulfillment",
            id: "eu-fulfillment",
            options: {
              beneluxFreeThresholdEur: 25,
              euFreeThresholdEur: 50,
              freeWeightGrams: 1000,
              palletWeightGrams: 24000,
              beneluxPalletEur: 45,
              euPalletEur: 85,
              letterboxRateEur: 4.25,
              beneluxParcelRateEur: 6.95,
              euParcelRateEur: 12.95,
            },
          },
        ],
      },
    },
  ],
})
```

---

## Options Reference (`EuFulfillmentOptions`)

| Option                                     | Default          | Description                                                    |
| :----------------------------------------- | :--------------- | :------------------------------------------------------------- |
| `beneluxFreeThresholdEur`                  | `25`             | Free-shipping subtotal threshold (EUR) for `NL`, `BE`, `LU`    |
| `euFreeThresholdEur`                       | `50`             | Free-shipping subtotal threshold (EUR) for other EU countries  |
| `freeWeightGrams`                          | `1000`           | Weight threshold (grams) qualifying for free standard shipping |
| `palletWeightGrams`                        | `24000`          | Weight threshold (grams) triggering `rotterdam-lcl-pallet`     |
| `beneluxPalletEur` / `euPalletEur`         | `45` / `85`      | Pallet freight rate (EUR)                                      |
| `letterboxRateEur`                         | `4.25`           | PostNL letterbox rate (EUR)                                    |
| `beneluxParcelRateEur` / `euParcelRateEur` | `6.95` / `12.95` | Standard parcel rate (EUR)                                     |

---

## Development & Testing

```bash
pnpm --filter @vicacha-devs/medusa-fulfillment-eu test
pnpm --filter @vicacha-devs/medusa-fulfillment-eu typecheck
```
