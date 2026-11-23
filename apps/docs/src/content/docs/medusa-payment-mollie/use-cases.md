---
title: "Mollie & B2B Net-14 — Data Models & Use Cases"
description: "Medusa v2 modules, data models, architecture diagram, and use cases for @vicacha-devs/medusa-payment-mollie."
---

Mollie (iDEAL, Bancontact, SEPA, Cards) and B2B Net-14 Invoice payment provider plugin for Medusa v2.

## Architecture Overview

```mermaid
flowchart LR
  Storefront["Storefront / Client"] -->|"0 Store API routes"| Plugin["@vicacha-devs/medusa-payment-mollie"]
  Admin["Medusa Admin UI (0 pages)"] -->|"0 Admin API routes"| Plugin
  Plugin --> Providers["Providers (mollie-payment)"]
```

## Medusa Modules & Data Models

| Module | Data Model                     |
| :----- | :----------------------------- |
| _None_ | _Provider / Route-only plugin_ |

## Key Capabilities & Integration Points

- **Package:** `@vicacha-devs/medusa-payment-mollie`
- **Workflows:** None
- **Event Subscribers:** None
- **Scheduled Jobs:** None
