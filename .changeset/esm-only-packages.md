---
"@vicacha-devs/medusa-plugin-b2b": minor
"@vicacha-devs/medusa-plugin-barcode": minor
"@vicacha-devs/medusa-plugin-dian": minor
"@vicacha-devs/medusa-plugin-documents": minor
"@vicacha-devs/medusa-fulfillment-eu": minor
"@vicacha-devs/medusa-plugin-notifications": minor
"@vicacha-devs/medusa-plugin-odoo": minor
"@vicacha-devs/medusa-payment-bold": minor
"@vicacha-devs/medusa-payment-mollie": minor
"@vicacha-devs/medusa-plugin-product-extensions": minor
"@vicacha-devs/medusa-plugin-social-commerce": minor
"@vicacha-devs/medusa-plugin-stories": minor
"@vicacha-devs/medusa-plugin-typesense": minor
---

**BREAKING — ESM-only packages.** Every `@vicacha-devs/*` plugin is now `"type": "module"` and publishes ES module output only (no CommonJS `require` condition).

- Source keeps extensionless relative imports; the build (`tsc-alias --resolve-full-paths`) adds `.js` extensions to the emitted output so it loads in Node ESM.
- The package root (`.`) no longer re-exports React/admin code (`./hooks`, `./ui`, `adminI18n`, `SUPPORTED_UI_LOCALES`). Import these from the existing `./hooks`, `./ui` and `./admin` subpaths instead.
- The `./admin` export now points at `.medusa/server/src/admin/index.js` (previously `index.mjs`/`index.js`).
- `@mikro-orm/migrations` is declared as a devDependency where migrations exist.
- `plugin:new` scaffolds ESM packages with a working build.
