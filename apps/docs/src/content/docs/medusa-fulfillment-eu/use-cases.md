---
title: "EU & Benelux Fulfillment — Data Models & Use Cases"
description: "Medusa v2 modules, data models, architecture diagram, and use cases for @vicacha-devs/medusa-fulfillment-eu."
---

EU & Benelux fulfillment provider plugin for Medusa v2 supporting PostNL letterbox, Sendcloud EU parcel, and Rotterdam LCL pallet freight.

## Architecture Overview

```mermaid
flowchart LR
  Storefront["Storefront / Client"] -->|"0 Store API routes"| Plugin["@vicacha-devs/medusa-fulfillment-eu"]
  Admin["Medusa Admin UI (0 pages)"] -->|"0 Admin API routes"| Plugin
  Plugin --> Providers["Providers (eu-fulfillment)"]
```

## Medusa Modules & Data Models

| Module | Data Model                     |
| :----- | :----------------------------- |
| _None_ | _Provider / Route-only plugin_ |

## Key Capabilities & Integration Points

- **Package:** `@vicacha-devs/medusa-fulfillment-eu`
- **Workflows:** None
- **Event Subscribers:** None
- **Scheduled Jobs:** None
