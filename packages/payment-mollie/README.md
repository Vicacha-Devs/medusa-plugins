# `@vicacha-devs/medusa-payment-mollie`

**Mollie** (iDEAL, Bancontact, SEPA, Cards) and **B2B Net-14 Invoice** payment provider plugin for **Medusa v2**.

---

## Key Features

- **Mollie Payment Provider (`mollie-ideal`)**:
  - Supports `initiatePayment`, `authorizePayment`, `capturePayment`, `refundPayment`, `cancelPayment`, `deletePayment`, `retrievePayment`, `updatePayment`, `getPaymentStatus`, and `getWebhookActionAndData`.
  - Validates Mollie payment IDs (`/^tr_[A-Za-z0-9]{6,40}$/`) and enforces SSRF-safe `baseUrl` overrides (`https://` or non-production loopback `127.0.0.1`/`localhost` for QA emulators).
- **B2B Net-14 Invoice Support**: Pairs with B2B checkout workflows for Net-14 deferred invoicing alongside instant Mollie methods.

---

## Installation & Configuration

```bash
pnpm add @vicacha-devs/medusa-payment-mollie
```

Register in `medusa-config.ts`:

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-payment-mollie",
      options: {},
    },
  ],
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve:
              "@vicacha-devs/medusa-payment-mollie/providers/mollie-payment",
            id: "mollie-ideal",
            options: {
              apiKey: process.env.MOLLIE_API_KEY,
              webhookUrl: process.env.MOLLIE_WEBHOOK_URL,
            },
          },
        ],
      },
    },
  ],
})
```

### Environment Variables

| Variable             | Description                                                   |
| :------------------- | :------------------------------------------------------------ |
| `MOLLIE_API_KEY`     | Mollie live (`live_...`) or test (`test_...`) API key         |
| `MOLLIE_WEBHOOK_URL` | Optional public HTTPS webhook URL for Mollie status callbacks |

---

## Development & Testing

```bash
pnpm --filter @vicacha-devs/medusa-payment-mollie test
pnpm --filter @vicacha-devs/medusa-payment-mollie typecheck
```
