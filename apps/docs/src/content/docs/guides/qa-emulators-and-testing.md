---
title: QA Emulators & Testing
description: 4-layer offline QA verification, loopback external-gateway emulators, adversarial judges, and Playwright E2E testing.
---

Every plugin in `@vicacha-devs/medusa-v2-extensions` is verified offline before any Docker or live sandbox run.

## Offline Verification (`pnpm qa:verify`)

```bash
pnpm qa:doctor   # Environment & Medusa version drift checks
pnpm qa:judges   # Adversarial quality judges (manifests, tests, i18n parity, sandbox wiring)
pnpm qa:verify   # Doctor + judges + publint + all plugin test suites -> .qa/dashboard.html
```

## 4-Layer External Gateway QA Emulator Blueprint

Plugins integrating external APIs (`payment-bold`, `dian`, `odoo`, `notifications`) follow a 4-layer automation blueprint:

1. **SSRF-Guarded Base URL Overrides**: Allow `https://` or loopback `http://127.0.0.1` / `http://localhost` overrides in non-production environments.
2. **Loopback QA Emulator (`127.0.0.1`)**: Pure `node:http` server emulating external endpoints with `/__qa/simulate-*` and `/__qa/fault` controls (e.g., `pnpm bold:emulator`).
3. **Fast Offline Use-Case Matrix (`node --test`)**: Exercises positive flows, signed HMAC webhooks, SSE streams, refunds, and negative security cases over real loopback sockets.
4. **Playwright E2E + Scheduled Live Sandbox Contract CI**: Automated UI/API E2E in `apps/sandbox/e2e/` plus scheduled upstream contract checks.
