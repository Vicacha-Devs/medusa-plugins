---
title: "Bold Colombia Payments — Data Models & Use Cases"
description: "Medusa v2 modules, data models, architecture diagram, and use cases for @vicacha-devs/medusa-payment-bold."
---

Bold Colombia 4-channel payment suite (Payment Button, Payment Links, Online API for Cards/PSE/Nequi/QR, and Smart POS Terminals) with loopback QA emulator.

## Architecture Overview

```mermaid
flowchart LR
  Storefront["Storefront / Client"] -->|"1 Store API routes"| Plugin["@vicacha-devs/medusa-payment-bold"]
  Admin["Medusa Admin UI (1 pages)"] -->|"12 Admin API routes"| Plugin
  Plugin --> Workflows["Workflows (8)"]
  Plugin --> Providers["Providers (bold-button, bold-link, bold-online, bold-terminal)"]
  External["External Gateway"] -->|"1 Webhooks"| Plugin
```

## Medusa Modules & Data Models

| Module | Data Model |
| :--- | :--- |
| _None_ | _Provider / Route-only plugin_ |

## Key Capabilities & Integration Points

- **Package:** `@vicacha-devs/medusa-payment-bold`
- **Workflows:** `create-bold-payment-link`, `create-bold-refund`, `get-bold-payment-methods`, `get-integration-api-payment-methods`, `get-payment-link-methods`, `get-terminals`, `create-bold-link`, `refund-bold-payment`
- **Event Subscribers:** None
- **Scheduled Jobs:** None
