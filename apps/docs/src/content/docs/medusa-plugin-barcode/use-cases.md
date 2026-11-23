---
title: "Barcode, GS1 & Stock-Take — Data Models & Use Cases"
description: "Medusa v2 modules, data models, architecture diagram, and use cases for @vicacha-devs/medusa-plugin-barcode."
---

4-in-1 Barcode, GS1/QR generation, multi-provider GTIN lookup, thermal ZPL II & sheet label printing, anti-counterfeit verification, and warehouse stock-take.

## Architecture Overview

```mermaid
flowchart LR
  Storefront["Storefront / Client"] -->|"5 Store API routes"| Plugin["@vicacha-devs/medusa-plugin-barcode"]
  Admin["Medusa Admin UI (7 pages)"] -->|"24 Admin API routes"| Plugin
  Plugin --> Modules["Medusa Modules (barcode)"]
  Plugin --> Workflows["Workflows (7)"]
```

## Medusa Modules & Data Models

| Module | Data Model |
| :--- | :--- |
| `barcode` | _(service-only module)_ |

## Key Capabilities & Integration Points

- **Package:** `@vicacha-devs/medusa-plugin-barcode`
- **Workflows:** `apply-inventory-count`, `batch-barcode-import`, `bulk-generate-variant-barcodes`, `generate-barcode-tag`, `helpers`, `lookup-and-create-product`, `scan-inventory-count`
- **Event Subscribers:** `product-created`
- **Scheduled Jobs:** `purge-expired-barcode-cache`
