---
title: "Omnichannel Notifications — Data Models & Use Cases"
description: "Medusa v2 modules, data models, architecture diagram, and use cases for @vicacha-devs/medusa-plugin-notifications."
---

Multi-channel notification studio for Medusa v2: visual template builder, event mappings, consent ledger, abandoned cart recovery, broadcasts, and 6+ providers.

## Architecture Overview

```mermaid
flowchart LR
  Storefront["Storefront / Client"] -->|"3 Store API routes"| Plugin["@vicacha-devs/medusa-plugin-notifications"]
  Admin["Medusa Admin UI (7 pages)"] -->|"19 Admin API routes"| Plugin
  Plugin --> Modules["Medusa Modules (notifications)"]
  Plugin --> Providers["Providers (dummy-sandbox, email-smtp, slack, sms, telegram, whatsapp)"]
```

## Medusa Modules & Data Models

| Module | Data Model |
| :--- | :--- |
| `notifications` | _(service-only module)_ |

## Key Capabilities & Integration Points

- **Package:** `@vicacha-devs/medusa-plugin-notifications`
- **Workflows:** None
- **Event Subscribers:** `customer-and-document-events`, `fulfillment-and-inventory-events`, `order-events`
- **Scheduled Jobs:** `abandoned-cart-recovery`, `log-retention-and-broadcasts`
