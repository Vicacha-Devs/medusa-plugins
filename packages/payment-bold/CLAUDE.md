# CLAUDE.md — `@vicacha-devs/medusa-payment-bold`

## Project Overview

`@vicacha-devs/medusa-payment-bold` is a Medusa v2 4-channel payment provider and Admin order operations plugin for **Bold.co** (Colombia):
- **4 Payment Providers**: `bold-link` (`pp_bold-link_bold`), `bold-online` (`pp_bold-online_bold`), `bold-button` (`pp_bold-button_bold`), and `bold-terminal` (`pp_bold-terminal_bold`).
- **Core Services**: `BoldHttpClient` (`src/services/bold-client.ts`) with SSRF-guarded base URL overrides for QA, and `BoldIntegrityService` (`src/services/integrity.ts`) for constant-time HMAC-SHA256 webhook verification and SHA-256 button integrity hashing.
- **Admin UI & SDK**: `BoldApiClient` (`src/sdk/client.ts`), React Query hooks (`src/hooks/`), SSE status streaming (`payment-stream`), and the Order Details widget (`src/admin/widgets/bold-payment-actions/`).

---

## Directory Layout

- `src/providers/`:
  - `bold-link/index.ts` — Payment Links (`POST /online/link/v1`, status polling, refunds).
  - `bold-online/index.ts` — QR (`BOLD_BASE64`, `PLAIN_BASE64`, `TEXT`), Cards, PSE, Nequi, Bancolombia (`POST /v1/payment-intent`).
  - `bold-button/index.ts` — Checkout Button with SHA-256 `hash` / `integrity_signature` and voucher authorization.
  - `bold-terminal/index.ts` — Physical Smart POS Dataphone dispatch (`POST /payments/app-checkout`).
- `src/api/`:
  - `admin/bold/{payment-link,payment-qr,payment-button,pos-push,terminals,payment-status,payment-stream,refund,banks,payment-methods,payment-link-methods}/route.ts`
  - `hooks/payment/bold/route.ts` — Fail-closed HMAC-SHA256 webhook handler validating signature, timestamp, amount, and currency.
- `src/__tests__/` & `scripts/`:
  - `bold-qa-emulator.ts` & `scripts/bold-emulator.ts` — Loopback-only (`127.0.0.1`) Bold HTTP emulator with `/__qa/simulate-payment` & `/__qa/fault`.
  - `bold-contract.spec.ts` & `bold-use-cases.spec.ts` — Offline automated 4-channel lifecycle, webhook, SSE, refund, and security tests.
  - `register-ts-resolver.mjs` & `medusa-payment-shim.mjs` — Zero-install Node test runner hooks + validating Zod micro-shim.

---

## Engineering & Security Invariants

1. **Fail-Closed Webhook Verification**:
   - `POST /hooks/payment/bold` must resolve configured `buttonSecretKey` / `integrationSecretKey` into `possibleSecrets`, reject missing/invalid HMAC signatures with `401`, and verify webhook `amount` and `currency` match the pending Medusa payment session before authorizing.
2. **SSRF-Safe Base URL Overrides**:
   - `BoldHttpClient` only accepts `https://` or loopback `http://127.0.0.1` / `http://localhost` overrides, and disables env var URL overrides when `NODE_ENV === "production"`.
3. **Medusa Payment Module Delegation**:
   - All `/admin/bold/*` routes must validate inputs with Zod and delegate session creation/capture/refunds through `Modules.PAYMENT` (`EMedusaFormatBoldPaymentProvider.*`).
4. **Automated 4-Channel QA Verification**:
   - Run `pnpm test` after any change to providers, routes, workflows, or `BoldHttpClient` to verify Link, QR, Button, POS, SSE, Webhook, and Fault paths offline.
