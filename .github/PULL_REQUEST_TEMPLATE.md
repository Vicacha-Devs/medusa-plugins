## Summary

<!-- Describe the changes introduced in this Pull Request and why they are needed. -->

## Related Issue(s)

- Closes #

## Affected Package(s)

- [ ] `@vicacha-devs/medusa-plugin-b2b`
- [ ] `@vicacha-devs/medusa-plugin-barcode`
- [ ] `@vicacha-devs/medusa-plugin-dian`
- [ ] `@vicacha-devs/medusa-plugin-documents`
- [ ] `@vicacha-devs/medusa-fulfillment-eu`
- [ ] `@vicacha-devs/medusa-plugin-notifications`
- [ ] `@vicacha-devs/medusa-plugin-odoo`
- [ ] `@vicacha-devs/medusa-payment-bold`
- [ ] `@vicacha-devs/medusa-payment-mollie`
- [ ] `@vicacha-devs/medusa-plugin-product-extensions`
- [ ] `@vicacha-devs/medusa-plugin-social-commerce`
- [ ] `@vicacha-devs/medusa-plugin-stories`
- [ ] `@vicacha-devs/medusa-plugin-typesense`
- [ ] `@vicacha-devs/medusa-shared-admin`
- [ ] `@vicacha-devs/medusa-sandbox` / `@vicacha-devs/docs`
- [ ] `@vicacha-devs/medusa-eslint-config` / `@vicacha-devs/medusa-typescript-config`

## Type of Change

- [ ] `feat`: New plugin feature, admin component, module, workflow, or API endpoint
- [ ] `fix`: Bug fix in API, workflows, providers, or admin UI
- [ ] `refactor`: Code restructuring / modularity improvement
- [ ] `docs`: README, OpenAPI, or documentation site update
- [ ] `test`: Unit (`node --test`) or Playwright E2E tests
- [ ] `build` / `ci` / `chore`: Build pipeline, Turborepo, QA scripts, or Changesets update

## Medusa v2 Plugin Verification Checklist

- [ ] **Format & Lint**: `pnpm format:check` and `pnpm lint` pass with 0 errors
- [ ] **Offline QA Gate**: `pnpm qa:verify` (doctor, judges, publint, plugin suites, sandbox wiring) passes
- [ ] **TypeScript Check**: `pnpm check` passes across all packages
- [ ] **500-Line Modularity Rule**: No source, test, or doc file exceeds **500 lines**
- [ ] **Admin i18n Parity**: Any new admin UI translation keys are added across all supported locales
- [ ] **Loopback & SSRF Safety**: QA emulators/configs bind strictly to `127.0.0.1` and external base URLs are SSRF-guarded
- [ ] **Changeset Included**: Ran `pnpm changeset` if this PR introduces user-facing package changes

## How to Test in Sandbox (`apps/sandbox`)

1. Run `pnpm build && pnpm sandbox:dev`
2.
3.
