---
title: "Product Extensions Suite — Data Models & Use Cases"
description: "Medusa v2 modules, data models, architecture diagram, and use cases for @vicacha-devs/medusa-plugin-product-extensions."
---

Rich video & 3D media, variant galleries, typed custom attributes with SI/Imperial normalization, hierarchical content sections, badges, swatches, and storefront overrides.

## Architecture Overview

```mermaid
flowchart LR
  Storefront["Storefront / Client"] -->|"3 Store API routes"| Plugin["@vicacha-devs/medusa-plugin-product-extensions"]
  Admin["Medusa Admin UI (9 pages)"] -->|"22 Admin API routes"| Plugin
  Plugin --> Modules["Medusa Modules (product-ext)"]
  Plugin --> Workflows["Workflows (2)"]
```

## Medusa Modules & Data Models

| Module | Data Model |
| :--- | :--- |
| `product-ext` | _(service-only module)_ |

## Key Capabilities & Integration Points

- **Package:** `@vicacha-devs/medusa-plugin-product-extensions`
- **Workflows:** `upsert-product-ext`, `upsert-variant-ext`
- **Event Subscribers:** `product-created`, `product-deleted`
- **Scheduled Jobs:** None
