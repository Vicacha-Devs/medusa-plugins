# @vicacha-devs/medusa-fulfillment-eu

## 0.1.2

### Patch Changes

- 2ef0d63: Add `repository` metadata (required for npm provenance) and ship the first release published with git tags and GitHub Releases.

## 0.1.1

### Patch Changes

- 5e32c5a: Add `repository` metadata (required for npm provenance) and ship the first release published with git tags and GitHub Releases.

## 0.1.0

### Minor Changes

- 6171c5b: **BREAKING — ESM-only packages.** Every `@vicacha-devs/*` plugin is now `"type": "module"` and publishes ES module output only (no CommonJS `require` condition).
  
  - Source keeps extensionless relative imports; the build (`tsc-alias --resolve-full-paths`) adds `.js` extensions to the emitted output so it loads in Node ESM.
  - The package root (`.`) no longer re-exports React/admin code (`./hooks`, `./ui`, `adminI18n`, `SUPPORTED_UI_LOCALES`). Import these from the existing `./hooks`, `./ui` and `./admin` subpaths instead.
  - The `./admin` export now points at `.medusa/server/src/admin/index.js` (previously `index.mjs`/`index.js`).
  - `@mikro-orm/migrations` is declared as a devDependency where migrations exist.
  - `plugin:new` scaffolds ESM packages with a working build.

### Patch Changes

- e854f66: Add package READMEs.
- b4c1e87: Add the `medusa-plugin-integration` npm keyword for discoverability.
