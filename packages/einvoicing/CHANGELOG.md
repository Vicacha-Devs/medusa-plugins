# @vicacha-devs/medusa-plugin-einvoicing

## 0.2.1

### Patch Changes

- 5e32c5a: Add `repository` metadata (required for npm provenance) and ship the first release published with git tags and GitHub Releases.

## 0.2.0

### Minor Changes

- e2cf112: Add the automations rule-engine plugin and the global e-invoicing plugin (Peppol / DIAN / CFDI / UBL), wire both into the sandbox.
- 80368dc: Register DIAN as an einvoicing fiscal driver with an optional bridge.

### Patch Changes

- 0784829: Tighten package manifests and tsconfig for automations and einvoicing, drop the unused admin-shared dependency, and use MedusaError in the DIAN einvoicing guard.
- be52434: Fix lint errors: service methods in automations and einvoicing now return `Promise<...>` (callers await them), Zod is imported from `@medusajs/framework/zod`, and Bold routes use `ContainerRegistrationKeys`.
