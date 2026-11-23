---
"@vicacha-devs/medusa-payment-bold": minor
"@vicacha-devs/medusa-plugin-b2b": minor
"@vicacha-devs/medusa-plugin-barcode": minor
"@vicacha-devs/medusa-plugin-dian": minor
"@vicacha-devs/medusa-plugin-documents": minor
"@vicacha-devs/medusa-plugin-notifications": minor
"@vicacha-devs/medusa-plugin-odoo": minor
"@vicacha-devs/medusa-plugin-product-extensions": minor
"@vicacha-devs/medusa-plugin-social-commerce": minor
"@vicacha-devs/medusa-plugin-stories": minor
"@vicacha-devs/medusa-plugin-typesense": minor
---

**BREAKING / MIGRATION NOTICE — Medusa `v2.23.0` (Express 5, React 19, Vite 8, Tailwind CSS 4, TanStack Table v9)**

Upgraded all `@vicacha-devs/*` Medusa plugins and shared admin components to **Medusa `2.23.0`** and **`@medusajs/ui` `4.3.0`**:

- **Minimum Requirements**: Node.js `>=22.22.0`, Medusa `2.23.0`, React `^19.3.1`, Vite `^8.3.8`, `react-i18next` `18.0.1`, `@tanstack/react-query` `5.107.1`, `@tanstack/react-table` `9.3.1`, `zod` `4.6.7`.
- **Host App Side Effects (see `MIGRATIONS.md`)**:
  - Do **not** install alongside React 18 / Vite 7 plugins (dual copies cause runtime `"Invalid hook call"` errors in Medusa Admin).
  - Rebuilt all admin bundles with Vite 8 (Rolldown/Oxc), updated Tailwind CSS 4 class names (`outline-none` -> `outline-hidden`, `flex-shrink-0` -> `shrink-0`), updated 4-arg TanStack Query mutation callbacks, and updated TanStack Table v9 typings.
  - Deploy all Redis/BullMQ 6 backend instances together (no downgrade against the same Redis DB) and review RBAC role policies (`search_index:*`, `workflow_execution:create`, `view_configuration`, `layout_configuration`) after startup.
