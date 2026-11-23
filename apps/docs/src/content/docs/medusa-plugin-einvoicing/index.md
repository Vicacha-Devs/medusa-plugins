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

Country-agnostic **Electronic Invoicing & Fiscal Compliance** core plugin for **Medusa v2** (`>= 2.23.0`), providing a unified `FiscalDocument` ledger, per-country `FiscalConfig`, pluggable `FiscalCountryDriver` adapters, and optional zero-hard-dependency bridges to `b2b`, `documents`, and `dian`.

---

## Key Features

- **Pluggable Country Drivers (`FiscalCountryDriver`)**:
  - `eu-peppol`: EU Peppol BIS 3.0 (`EN 16931` UBL 2.1 + EU VAT ID validation across `DE`, `NL`, `BE`, `FR`, `ES`, `IT`, `PL`, `PT`, `AT`, `SE`).
  - `co-dian`: Colombia DIAN UBL 2.1 — automatically delegates to [`@vicacha-devs/medusa-plugin-dian`](../dian/README.md) (`DianFiscalDriver`) for XAdES-EPES signing, DIAN SOAP, and Siigo/Alegra/Dataico/FacturaTech when installed; falls back to built-in UBL 2.1 + SHA-384 CUFE.
  - `mx-cfdi`: Mexico SAT CFDI 4.0 (RFC validation + UBL/XML generation).
  - `generic-webhook`: Country-agnostic UBL 2.1 / SSRF-guarded HTTPS fiscal webhook driver.
- **Optional Zero-Hard-Dependency Bridges**:
  - `@vicacha-devs/medusa-plugin-b2b`: Resolves B2B company tax IDs and legal names (`resolveOptionalB2BCompany`).
  - `@vicacha-devs/medusa-plugin-documents`: Links generated commercial PDFs (`pdf_document_id` via `resolveOptionalDocumentsPdfId`).
  - `@vicacha-devs/medusa-plugin-dian`: Serves as the full Colombia DIAN driver (`resolveOptionalDianService`).

---

## Installation & Configuration

```bash
pnpm add @vicacha-devs/medusa-plugin-einvoicing
```

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-einvoicing",
      options: {},
    },
  ],
})
```

---

## Data Models, Workflows & REST API

- **Models**: `fiscal_document` (`FiscalDocumentModel`) and `fiscal_config` (`FiscalConfigModel`).
- **Workflows**: `issueFiscalDocumentWorkflow` (auto-selects country driver, validates buyer tax ID, increments per-country sequence, resolves optional B2B/Documents/DIAN bridges, and persists `FiscalDocument`).
- **Admin Endpoints**:
  - `GET /admin/einvoicing` · `POST /admin/einvoicing`
  - `GET /admin/einvoicing/drivers`
  - `GET /admin/einvoicing/configs` · `POST /admin/einvoicing/configs`
- **Admin UI**: `/app/einvoicing` route listing issued fiscal documents across countries and drivers.

---

## Development & Testing

```bash
pnpm --filter @vicacha-devs/medusa-plugin-einvoicing test
pnpm --filter @vicacha-devs/medusa-plugin-einvoicing typecheck
```
