---
title: Security & RBAC
description: Security invariants, SSRF guards, webhook HMAC verification, and centralized RBAC route enforcement.
---

## Security Invariants

1. **Loopback-Only QA Infrastructure**: `docker-compose.qa.yml`, `apps/sandbox`, and QA emulators bind strictly to `127.0.0.1` (never `0.0.0.0`).
2. **SSRF-Guarded Gateway Overrides**: External gateway base URL overrides only permit `https://` or explicit loopback `127.0.0.1`/`localhost` targets outside production.
3. **Webhook Signature Verification**: Payment and ERP webhooks verify HMAC signatures using constant-time comparison before mutating state.
4. **Safe CLI & Script Execution**: Workspace scripts use `execFileSync` with argument arrays and strict path-boundary assertions (`assertWithinBoundary`), avoiding shell interpolation or `eval`.

## Enterprise RBAC Compatibility

If your Medusa v2 deployment uses Medusa Enterprise (`@medusajs/medusa/rbac` with `MEDUSA_LICENSE_KEY`), `@vicacha-devs/medusa-shared-admin` provides `<RbacGuard />` and `useRbacAccess` helpers for UI gating alongside Medusa's native role policies.
