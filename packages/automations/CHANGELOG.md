# @vicacha-devs/medusa-plugin-automations

## 0.2.0

### Minor Changes

- e2cf112: Add the automations rule-engine plugin and the global e-invoicing plugin (Peppol / DIAN / CFDI / UBL), wire both into the sandbox.

### Patch Changes

- be52434: Restore the default i18n export in the admin extension so the plugin admin build succeeds.
- e73a821: Restore the `@medusajs/admin-shared` dev and peer dependency; the generated admin extension imports it, so clean installs (CI) failed to build.
- 0784829: Tighten package manifests and tsconfig for automations and einvoicing, drop the unused admin-shared dependency, and use MedusaError in the DIAN einvoicing guard.
- be52434: Fix lint errors: service methods in automations and einvoicing now return `Promise<...>` (callers await them), Zod is imported from `@medusajs/framework/zod`, and Bold routes use `ContainerRegistrationKeys`.
