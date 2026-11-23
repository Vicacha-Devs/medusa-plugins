---
title: "DIAN Electronic Invoicing — Data Models & Use Cases"
description: "Medusa v2 modules, data models, architecture diagram, and use cases for @vicacha-devs/medusa-plugin-dian."
---

Colombian DIAN UBL 2.1 electronic invoicing (Resolución 000165), CUFE/CUDE SHA-384, XAdES-EPES signatures, SOAP Web Services, and pluggable providers.

## Architecture Overview

```mermaid
flowchart LR
  Storefront["Storefront / Client"] -->|"3 Store API routes"| Plugin["@vicacha-devs/medusa-plugin-dian"]
  Admin["Medusa Admin UI (4 pages)"] -->|"10 Admin API routes"| Plugin
  Plugin --> Modules["Medusa Modules (dian)"]
  Plugin --> Workflows["Workflows (1)"]
```

## Medusa Modules & Data Models

| Module | Data Model |
| :--- | :--- |
| `dian` | `dian-config` |
| `dian` | `dian-customer-fiscal-profile` |
| `dian` | `dian-electronic-document` |
| `dian` | `dian-resolution` |

## Key Capabilities & Integration Points

- **Package:** `@vicacha-devs/medusa-plugin-dian`
- **Workflows:** `emit-dian-document`
- **Event Subscribers:** `order-payment-captured`, `order-placed`, `order-refund-created`
- **Scheduled Jobs:** None
