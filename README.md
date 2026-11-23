# `@vicacha-devs/medusa-v2-extensions`

Enterprise **pnpm + Turborepo + Changesets** monorepo for Medusa v2 plugins, shared configs, offline testing shims, plugin scaffolding, external-gateway QA emulators, and an integrated Medusa sandbox host.

---

## Workspace Layout

```text
plugins/
├── .changeset/                # Independent plugin versioning & release notes
├── .github/workflows/         # CI QA gates, Sandbox E2E, Bold Live Sandbox & NPM OIDC release
├── apps/
│   └── sandbox/               # @vicacha-devs/medusa-sandbox wiring all 11 plugins + Playwright E2E
├── packages/
│   ├── eslint-config/         # @vicacha-devs/medusa-eslint-config (Medusa v2 flat config)
│   ├── plugin-testing/        # @vicacha-devs/medusa-plugin-testing (zero-install TS resolver & shim)
│   ├── shared/                # @vicacha-devs/medusa-shared-admin (shared admin components & hooks)
│   ├── typescript-config/     # @vicacha-devs/medusa-typescript-config (base & plugin tsconfigs)
│   └── <slug>/                # 11 publishable @vicacha-devs Medusa v2 plugins (b2b, payment-bold, ...)
├── scripts/
│   ├── create-plugin.ts       # Medusa v2 plugin scaffolder CLI (pnpm plugin:new)
│   ├── publint-all.ts         # Strict manifest, exports & publint validator
│   └── qa/                    # Doctor, judges, verify, report (HTML Control Center), smoke
├── docker-compose.qa.yml      # Loopback-only QA infra (5436/6383/8112/9007/1029)
└── .env.qa.example
```

---

## Included Medusa v2 Plugins (11 Publishable + 1 Shared Admin)

| Package                                          | Directory                     | Summary                                                                                  |
| :----------------------------------------------- | :---------------------------- | :--------------------------------------------------------------------------------------- |
| `@vicacha-devs/medusa-shared-admin`              | `packages/shared`             | Shared admin UI components, hooks & utilities consumed across plugins                    |
| `@vicacha-devs/medusa-plugin-b2b`                | `packages/b2b`                | B2B companies, employees, quotes, approvals, and spending limits                         |
| `@vicacha-devs/medusa-plugin-barcode`            | `packages/barcode`            | Barcode/GS1/QR generation, GTIN lookup, thermal/ZPL label printing & stock-take          |
| `@vicacha-devs/medusa-plugin-dian`               | `packages/dian`               | Colombian DIAN UBL 2.1 electronic invoicing, CUFE/CUDE & pluggable fiscal providers      |
| `@vicacha-devs/medusa-plugin-documents`          | `packages/documents`          | Invoice, packing slip & order PDF generation                                             |
| `@vicacha-devs/medusa-plugin-notifications`      | `packages/notifications`      | Multi-channel notification providers & templates                                         |
| `@vicacha-devs/medusa-plugin-odoo`               | `packages/odoo`               | Bidirectional Odoo ERP (JSON-RPC 2.0 & JSON-2) sync & POS replay                         |
| `@vicacha-devs/medusa-payment-bold`              | `packages/payment-bold`       | Bold Colombia 4-channel suite (Payment Link, QR/Online, Button, Smart POS) + QA Emulator |
| `@vicacha-devs/medusa-plugin-product-extensions` | `packages/product-extensions` | Rich video/3D media, variant galleries, custom attributes & swatches                     |
| `@vicacha-devs/medusa-plugin-social-commerce`    | `packages/social-commerce`    | Social commerce feeds & shoppable channel integrations                                   |
| `@vicacha-devs/medusa-plugin-stories`            | `packages/stories`            | Shoppable story reels & admin curation                                                   |
| `@vicacha-devs/medusa-plugin-typesense`          | `packages/typesense`          | Typesense search indexing, filter compiler & storefront SDK                              |

---

## QA & Plugin Lifecycle Commands

```bash
# 1. Environment doctor & cross-repo Medusa version drift check (offline)
pnpm qa:doctor

# 2. Adversarial quality judges (manifests, tests, sandbox wiring, i18n parity)
pnpm qa:judges

# 3. Full offline QA gate (doctor + judges + publint + all 11 plugin suites + sandbox wiring)
#    Emits .qa/report.json and interactive .qa/dashboard.html
pnpm qa:verify

# 4. Aggregate all sibling Vicacha repos into a multi-repo HTML Control Center
pnpm qa:report

# 5. Scaffold a new Medusa v2 plugin with tests, i18n, routes, workflow & sandbox wiring
pnpm plugin:new -- loyalty-points --display-name "Loyalty Points" --wire-sandbox
# Preview without writing files:
pnpm plugin:new -- loyalty-points --dry-run

# 6. Port-isolated Docker QA infrastructure (127.0.0.1 loopback only; copy .env.qa.example -> .env.qa)
pnpm qa:docker:up
pnpm qa:smoke
pnpm qa:e2e
pnpm qa:docker:down
```

### Port Isolation (`docker-compose.qa.yml`)

All services bind strictly to `127.0.0.1` so this monorepo can run concurrently alongside `vicacha-travels`, `central-mosque-bogota`, and `strapi-v5-extensions`:

| Service                         | Loopback Port                       |
| :------------------------------ | :---------------------------------- |
| PostgreSQL 16                   | `127.0.0.1:5436`                    |
| Valkey 9                        | `127.0.0.1:6383`                    |
| Typesense 29                    | `127.0.0.1:8112`                    |
| MinIO API / Console             | `127.0.0.1:9007` / `127.0.0.1:9012` |
| Mailpit SMTP / UI               | `127.0.0.1:1029` / `127.0.0.1:8029` |
| Medusa Sandbox (`apps/sandbox`) | `127.0.0.1:9001`                    |

---

## External Gateway QA Emulator Blueprint (`medusa-payment-bold`)

For plugins integrating external APIs or hardware (Bold, DIAN, Odoo, notifications), follow the 4-layer automation blueprint implemented in [`packages/payment-bold`](./packages/payment-bold/README.md):

1. **Injectable Base URLs (SSRF-guarded)**: Allow `https://` or loopback `http://127.0.0.1` overrides via options/env in non-production.
2. **Loopback QA Emulator (`127.0.0.1`)**: Pure `node:http` server emulating external endpoints + `/__qa/simulate-*` and `/__qa/fault` controls (`pnpm bold:emulator`).
3. **Fast Offline Use-Case Matrix (`node --test`)**: Exercises every channel, signed webhook, SSE stream, refund, and negative security case over real loopback TCP sockets in seconds.
4. **Playwright E2E + Scheduled Live Sandbox Contract CI**: Automated UI/API E2E against the emulator ([`apps/sandbox/e2e/bold-payment-flows.spec.ts`](./apps/sandbox/e2e/bold-payment-flows.spec.ts)) plus weekly upstream contract checks ([`.github/workflows/bold-live-sandbox.yml`](./.github/workflows/bold-live-sandbox.yml)).
