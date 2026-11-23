---
title: "Odoo ERP Bidirectional Sync — Data Models & Use Cases"
description: "Medusa v2 modules, data models, architecture diagram, and use cases for @vicacha-devs/medusa-plugin-odoo."
---

Bidirectional Odoo 14–19+ (JSON-RPC 2.0 & JSON-2) sync for products, multi-warehouse inventory drift reconciliation, orders, invoices, and offline POS replay.

## Architecture Overview

```mermaid
flowchart LR
  Storefront["Storefront / Client"] -->|"2 Store API routes"| Plugin["@vicacha-devs/medusa-plugin-odoo"]
  Admin["Medusa Admin UI (5 pages)"] -->|"20 Admin API routes"| Plugin
  Plugin --> Modules["Medusa Modules (odoo, odoo-sync)"]
  External["External Gateway"] -->|"1 Webhooks"| Plugin
```

## Medusa Modules & Data Models

| Module | Data Model |
| :--- | :--- |
| `odoo` | _(service-only module)_ |
| `odoo-sync` | _(service-only module)_ |

## Key Capabilities & Integration Points

- **Package:** `@vicacha-devs/medusa-plugin-odoo`
- **Workflows:** None
- **Event Subscribers:** `customer-updated`, `inventory-updated`, `order-placed`, `product-updated`
- **Scheduled Jobs:** `odoo-reconciliation`, `odoo-scheduled-sync`
