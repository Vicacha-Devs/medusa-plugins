# `@vicacha-devs/medusa-sandbox`

Medusa v2 host sandbox application (`@medusajs/medusa` `2.21.0`) wiring all **11 `@vicacha-devs/*` Medusa plugins** for isolated integration, smoke, and Playwright E2E QA on `http://127.0.0.1:9001`.

---

## Purpose

- Verifies every publishable Medusa plugin in `packages/<slug>` loads cleanly inside a single Medusa v2 server (`medusa-config.ts`).
- Runs offline manifest and plugin-wiring contract checks (`tests/sandbox-wiring.spec.ts`) without requiring Docker or PostgreSQL.
- Hosts Playwright E2E suites (`e2e/`) verifying Admin/health auth guards and full 4-channel Bold payment workflows against the local Bold QA Emulator.

---

## Commands

Run from the monorepo root (`medusa-plugins/`) or inside `apps/sandbox/`:

```bash
# Offline plugin wiring contract test (zero Docker)
pnpm --filter @vicacha-devs/medusa-sandbox test

# Start port-isolated QA Compose stack (Postgres 5436, Valkey 6383, Typesense 8112, MinIO 9007/9012, Mailpit 1029/8029)
cp .env.qa.example .env.qa
pnpm qa:docker:up

# Start Medusa Sandbox on http://127.0.0.1:9001
cp apps/sandbox/.env.example apps/sandbox/.env
pnpm --filter @vicacha-devs/medusa-sandbox dev

# Start Bold QA Emulator on http://127.0.0.1:4010 (for bold-payment-flows E2E)
pnpm bold:emulator

# Run live HTTP smoke & Playwright E2E suites
pnpm qa:smoke
pnpm qa:e2e

# Tear down QA Compose stack
pnpm qa:docker:down
```

---

## Included Tests

| File                                                                 | Mode                    | What It Verifies                                                                                                   |
| :------------------------------------------------------------------- | :---------------------- | :----------------------------------------------------------------------------------------------------------------- |
| [`tests/sandbox-wiring.spec.ts`](./tests/sandbox-wiring.spec.ts)     | Offline (`node --test`) | All 11 workspace plugins declared in `package.json` and wired in `medusa-config.ts`                                |
| [`e2e/admin-smoke.spec.ts`](./e2e/admin-smoke.spec.ts)               | Playwright E2E          | `/health` liveness, Admin UI login shell, and `401` enforcement on unauthenticated `/admin/*` endpoints            |
| [`e2e/bold-payment-flows.spec.ts`](./e2e/bold-payment-flows.spec.ts) | Playwright E2E          | Bold Payment Link, QR Code, and Smart POS Terminal flows + signed HMAC webhook simulation against `BoldQaEmulator` |
