---
title: "Bold Colombia Payments"
description: "Comprehensive Bold Colombia payment integration for Medusa v2 supporting Button, Links, Online API (Cards, PSE, Nequi, QR), and Smart POS Terminals."
---

> **Package:** `@vicacha-devs/medusa-payment-bold` · **Version:** `0.0.1` · **Category:** Payments

## Package Snapshot

| Capability                | Details                                             |
| :------------------------ | :-------------------------------------------------- |
| Medusa Modules / Models   | 0 modules / 0 data models                           |
| Workflows                 | 8                                                   |
| Subscribers / Jobs        | 0 subscribers / 0 scheduled jobs                    |
| Providers                 | bold-button, bold-link, bold-online, bold-terminal  |
| Admin UI Routes / Widgets | 1 routes / 9 widgets                                |
| Admin i18n Locales        | ar, en, es, tr                                      |
| HTTP Endpoints            | 14 ([OpenAPI Reference](/medusa-payment-bold/api/)) |

Comprehensive **Bold Colombia** 4-channel payment suite (`bold-link`, `bold-online`, `bold-button`, `bold-terminal`), Admin operations widget, real-time SSE status streaming, HMAC-SHA256 webhook verification, and built-in **QA Gateway Emulator** for **Medusa v2**.

> **Medusa compatibility:** `>= 2.19.x / 2.21.x` · **Node.js:** `>= 20.19.0 || >= 22.12.0`

---

## Payment Providers (4 Channels)

| Provider ID     | Medusa Registration ID  | Bold API Endpoint                                                | Use Case                                                                                  |
| :-------------- | :---------------------- | :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| `bold-link`     | `pp_bold-link_bold`     | `POST /online/link/v1`                                           | Shareable payment links with VAT breakdown & nanosecond expiration                        |
| `bold-online`   | `pp_bold-online_bold`   | `POST /v1/payment-intent`                                        | Dynamic QR (`BOLD_BASE64`, `PLAIN_BASE64`, `TEXT`), Cards, PSE, Nequi, Bancolombia        |
| `bold-button`   | `pp_bold-button_bold`   | SHA-256 integrity hash + `/v2/payment-voucher/:ref`              | Storefront Bold Boton de Pagos checkout with deterministic `hash` / `integrity_signature` |
| `bold-terminal` | `pp_bold-terminal_bold` | `GET /payments/binded-terminals` + `POST /payments/app-checkout` | Physical Smart POS Dataphone payment dispatch                                             |

---

## Configuration (`medusa-config.ts`)

```ts
{
  resolve: "@vicacha-devs/medusa-payment-bold/providers/bold-link",
  id: "bold",
  options: {
    buttonApiKey: process.env.BOLD_BUTTON_API_KEY,
    buttonSecretKey: process.env.BOLD_BUTTON_SECRET_KEY,
    integrationApiKey: process.env.BOLD_INTEGRATION_API_KEY,
    integrationSecretKey: process.env.BOLD_INTEGRATION_SECRET_KEY,
    defaultCurrency: "COP",
    linkExpirationMinutes: 15,
    // Optional QA / Emulator overrides (https:// or loopback http://127.0.0.1 only)
    integrationsUrl: process.env.BOLD_INTEGRATIONS_URL,
    onlineUrl: process.env.BOLD_ONLINE_URL,
    paymentsUrl: process.env.BOLD_PAYMENTS_URL,
  },
}
```

> **SSRF Protection**: `BoldHttpClient` strictly enforces that base URL overrides use `https://` or loopback `http://127.0.0.1` / `http://localhost` (environment fallbacks are ignored when `NODE_ENV=production`).

---

## REST API & Webhooks

| Method | Route                              | Description                                                                                                          |
| :----- | :--------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/admin/bold/payment-link`         | Zod-validated Payment Link creation via `createBoldPaymentLinkWorkflow` (`pp_bold-link_bold`)                        |
| `POST` | `/admin/bold/payment-qr`           | Zod-validated QR session creation (`pp_bold-online_bold`), returns `{ qr_payload, paymentSession }`                  |
| `POST` | `/admin/bold/payment-button`       | Zod-validated Button session creation (`pp_bold-button_bold`) with SHA-256 `hash` / `integrity_signature`            |
| `GET`  | `/admin/bold/terminals`            | Lists bound POS dataphones (`GET /payments/binded-terminals`)                                                        |
| `POST` | `/admin/bold/pos-push`             | Zod-validated POS dataphone checkout dispatch (`pp_bold-terminal_bold`)                                              |
| `GET`  | `/admin/bold/payment-status`       | Queries Medusa payment session status by `paymentSessionId`                                                          |
| `GET`  | `/admin/bold/payment-stream`       | Server-Sent Events (`text/event-stream`) polling Bold & auto-capturing on authorization                              |
| `POST` | `/admin/bold/refund`               | Full or partial refund via `refundBoldPaymentWorkflow` (`POST /v1/refunds`)                                          |
| `GET`  | `/admin/bold/banks`                | Active PSE financial institutions (`GET /v1/payment/pse/banks`)                                                      |
| `GET`  | `/admin/bold/payment-methods`      | Merchant enabled Integration API methods                                                                             |
| `GET`  | `/admin/bold/payment-link-methods` | Payment Link API method min/max limits                                                                               |
| `POST` | `/hooks/payment/bold`              | Fail-closed HMAC-SHA256 (`x-bold-signature` + `x-bold-timestamp`) webhook verifier with amount & currency validation |

---

## Automated 4-Channel QA & Bold QA Emulator

You do **not** need a physical Bold dataphone or live sandbox credentials to test Payment Links, QR Codes, Checkout Buttons, POS Terminals, Webhooks, SSE Streaming, or Refunds.

### 1. Run Offline 4-Channel Use-Case Suite (`< 4s`, Zero Docker)

```bash
pnpm test
```

Executes [`src/__tests__/bold-contract.spec.ts`](./src/__tests__/bold-contract.spec.ts) and [`src/__tests__/bold-use-cases.spec.ts`](./src/__tests__/bold-use-cases.spec.ts) over real `127.0.0.1` loopback HTTP against [`BoldQaEmulator`](./src/__tests__/bold-qa-emulator.ts):

- **Payment Link**: Zod validation -> VAT calculation (`base` + `value`) -> signed HMAC webhook -> partial refund + over-refund `422` rejection.
- **QR Code**: `BOLD_BASE64` & `TEXT` intents -> approval & `EXPIRED` status transitions.
- **Checkout Button**: Deterministic SHA-256 hash verification -> voucher lookup authorization -> full refund.
- **POS Terminal**: Bound terminal discovery -> dataphone push -> **Approved Tap** with live SSE auto-capture stream, **Declined Card** (`REJECTED`), and unbound terminal `404` handling.
- **Security & Fault Injection**: Missing/forged HMAC (`401`), tampered webhook amount (rejected), SSRF non-loopback `http://` rejection, and Bold `401` error mapping.

### 2. Run Standalone Bold QA Emulator (for Local Dev & Playwright E2E)

```bash
pnpm emulator
```

QA Control Endpoints on the running emulator:

- `GET /__qa/health` — Emulator health check
- `GET /__qa/requests` — Inspect all captured Bold API requests & headers
- `POST /__qa/simulate-payment` — Body `{ "reference": "ORD-1", "outcome": "APPROVED"|"REJECTED"|"EXPIRED", "webhookUrl": "http://127.0.0.1:9001/hooks/payment/bold" }` transitions payment status and delivers a real HMAC-SHA256 signed webhook
- `POST /__qa/fault` — Inject deterministic `401` / `422` / `500` faults on the next matching request
- `POST /__qa/reset` — Reset emulator ledger

### 3. Full-Stack Playwright E2E & Weekly Live Sandbox Check

- **Playwright E2E**: [`apps/sandbox/e2e/bold-payment-flows.spec.ts`](../../apps/sandbox/e2e/bold-payment-flows.spec.ts) runs Link, QR, and POS flows against Medusa Sandbox + Bold QA Emulator.
- **Upstream Live Sandbox Contract**: [`.github/workflows/bold-live-sandbox.yml`](../../.github/workflows/bold-live-sandbox.yml) runs weekly (and via `workflow_dispatch`) against real Bold sandbox keys configured in GitHub Secrets.

---

## License

MIT © Vicacha Devs
