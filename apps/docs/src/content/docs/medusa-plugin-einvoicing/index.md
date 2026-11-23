---
title: "Global E-Invoicing (Peppol / DIAN / CFDI)"
description: "E-Invoicing plugin for Medusa v2 by Vicacha Devs."
---

> **Package:** `@vicacha-devs/medusa-plugin-einvoicing` · **Version:** `0.1.0` · **Category:** Compliance & Invoicing

## Package Snapshot

| Capability                | Details                                                 |
| :------------------------ | :------------------------------------------------------ |
| Medusa Modules / Models   | 1 modules / 2 data models                               |
| Workflows                 | 0                                                       |
| Subscribers / Jobs        | 0 subscribers / 0 scheduled jobs                        |
| Providers                 | —                                                       |
| Admin UI Routes / Widgets | 1 routes / 0 widgets                                    |
| Admin i18n Locales        | en                                                      |
| HTTP Endpoints            | 5 ([OpenAPI Reference](/medusa-plugin-einvoicing/api/)) |

Country-agnostic **Electronic Invoicing & Fiscal Compliance** plugin for **Medusa v2** (`>= 2.23.0`).

- **Pluggable Country Drivers**:
  - `eu-peppol`: EU Peppol BIS 3.0 (EN 16931 UBL 2.1 + EU VAT ID validation across DE, NL, BE, FR, ES, IT, PL, PT, AT, SE)
  - `co-dian`: Colombia DIAN UBL 2.1 (Resolución 000165 + NIT/CC validation + SHA-384 CUFE)
  - `mx-cfdi`: Mexico SAT CFDI 4.0 (RFC validation + XML/UUID)
  - `generic-webhook`: Country-agnostic UBL 2.1 / SSRF-guarded HTTPS webhook driver
- **Optional Zero-Hard-Dependency Bridges**:
  - `@vicacha-devs/medusa-plugin-b2b`: Automatically resolves B2B company tax IDs and legal names.
  - `@vicacha-devs/medusa-plugin-documents`: Links generated commercial PDFs (`pdf_document_id`).

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-einvoicing
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-einvoicing",
      options: {},
    },
  ],
})
```
