---
title: "Global E-Invoicing (Peppol / DIAN / CFDI) — Data Models & Use Cases"
description: "Medusa v2 modules, data models, architecture diagram, and use cases for @vicacha-devs/medusa-plugin-einvoicing."
---

Country-agnostic electronic invoicing plugin for Medusa v2 with pluggable drivers (EU Peppol EN 16931, Colombia DIAN, Mexico CFDI 4.0, Generic UBL 2.1) and optional B2B & Documents bridges.

## Architecture Overview

```mermaid
flowchart LR
  Storefront["Storefront / Client"] -->|"0 Store API routes"| Plugin["@vicacha-devs/medusa-plugin-einvoicing"]
  Admin["Medusa Admin UI (1 pages)"] -->|"5 Admin API routes"| Plugin
  Plugin --> Modules["Medusa Modules (einvoicing)"]
```

## Medusa Modules & Data Models

| Module       | Data Model        |
| :----------- | :---------------- |
| `einvoicing` | `fiscal-config`   |
| `einvoicing` | `fiscal-document` |

## Key Capabilities & Integration Points

- **Package:** `@vicacha-devs/medusa-plugin-einvoicing`
- **Workflows:** None
- **Event Subscribers:** None
- **Scheduled Jobs:** None
