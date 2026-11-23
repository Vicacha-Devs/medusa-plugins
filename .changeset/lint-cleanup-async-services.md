---
"@vicacha-devs/medusa-plugin-automations": patch
"@vicacha-devs/medusa-plugin-einvoicing": patch
"@vicacha-devs/medusa-plugin-b2b": patch
"@vicacha-devs/medusa-plugin-barcode": patch
"@vicacha-devs/medusa-plugin-dian": patch
"@vicacha-devs/medusa-plugin-documents": patch
"@vicacha-devs/medusa-plugin-notifications": patch
"@vicacha-devs/medusa-plugin-typesense": patch
"@vicacha-devs/medusa-payment-bold": patch
---

Fix lint errors: service methods in automations and einvoicing now return `Promise<...>` (callers await them), Zod is imported from `@medusajs/framework/zod`, and Bold routes use `ContainerRegistrationKeys`.
