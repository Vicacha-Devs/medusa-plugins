# CLAUDE.md — `@vicacha-devs/medusa-v2-extensions`

## Monorepo Overview

Enterprise **pnpm + Turborepo + Changesets** monorepo for all `@vicacha-devs/*` **Medusa v2** plugins, shared configs, offline testing harnesses, external-gateway QA emulators, and an integrated Medusa sandbox host (`apps/sandbox`).

- **Publishable Plugins (`packages/<slug>`)**: 11 Medusa v2 plugins (`b2b`, `barcode`, `dian`, `documents`, `notifications`, `odoo`, `payment-bold`, `product-extensions`, `social-commerce`, `stories`, `typesense`).
- **Internal Packages**: `@vicacha-devs/medusa-shared-admin` (`packages/shared`), `@vicacha-devs/medusa-typescript-config`, `@vicacha-devs/medusa-eslint-config`, `@vicacha-devs/medusa-plugin-testing`.
- **Host Sandbox (`apps/sandbox`)**: `@vicacha-devs/medusa-sandbox` wiring all 11 plugins on `http://127.0.0.1:9001` with offline wiring contract tests and Playwright E2E suites.

---

## Core Commands

```bash
# Offline QA doctor, judges, publint & all 11 plugin suites (+ .qa/dashboard.html)
pnpm qa:doctor
pnpm qa:judges
pnpm qa:verify
pnpm qa:report

# Scaffold a new compliant Medusa v2 plugin
pnpm plugin:new -- <slug> --display-name "<Title>" --wire-sandbox

# Validate manifests, exports & build integrity across all plugins
pnpm publint:all

# Start standalone Bold QA Emulator (127.0.0.1:4010)
pnpm bold:emulator

# Port-isolated loopback-only Docker QA stack (5436/6383/8112/9007/1029)
pnpm qa:docker:up
pnpm qa:smoke
pnpm qa:e2e
pnpm qa:docker:down
```

---

## Engineering & Security Invariants

1. **Zero Hardcoded Machine Paths**: Never commit local filesystem paths (e.g. `/Users/...`) in `package.json`, scripts, or configs.
2. **Loopback-Only QA Infrastructure**: `docker-compose.qa.yml`, `apps/sandbox`, Playwright configs, and external-gateway QA emulators must bind strictly to `127.0.0.1` (never `0.0.0.0`).
3. **SSRF-Guarded External Gateway Overrides**: Any plugin calling external APIs (Bold, DIAN, Odoo, notifications) must follow the 4-layer QA Emulator Blueprint demonstrated in [`packages/payment-bold`](./packages/payment-bold/CLAUDE.md):
   - Allow `https://` or loopback `http://127.0.0.1` / `http://localhost` base URL overrides outside production.
   - Provide a pure `node:http` loopback emulator with `/__qa/simulate-*` and `/__qa/fault` controls.
   - Ship fast offline `node --test` use-case suites exercising positive, negative, webhook HMAC, and fault paths.
   - Pair with Playwright E2E specs in `apps/sandbox/e2e/` and optional scheduled live-sandbox contract CI.
4. **Offline-First Verification**: Every plugin must expose `test` and `typecheck` scripts that pass cleanly under `pnpm qa:verify`.
5. **Safe CLI & Dashboard Scripting**: Never use `execSync`, shell interpolation, `innerHTML`, `outerHTML`, or `eval` in `scripts/`. Use `execFileSync` with argument arrays and strict path-boundary assertions (`assertWithinDir`).
6. **File Modularity**: Keep individual source, test, QA script, and documentation files `<= 500` lines.
