---
title: "B2B Companies & Quotes — Data Models & Use Cases"
description: "Medusa v2 modules, data models, architecture diagram, and use cases for @vicacha-devs/medusa-plugin-b2b."
---

B2B companies, employee hierarchies, approval rules, spending limits, and quote negotiation workflows for Medusa v2.

## Architecture Overview

```mermaid
flowchart LR
  Storefront["Storefront / Client"] -->|"22 Store API routes"| Plugin["@vicacha-devs/medusa-plugin-b2b"]
  Admin["Medusa Admin UI (13 pages)"] -->|"27 Admin API routes"| Plugin
  Plugin --> Modules["Medusa Modules (approval, company, quote)"]
  Plugin --> Workflows["Workflows (24)"]
```

## Medusa Modules & Data Models

| Module     | Data Model          |
| :--------- | :------------------ |
| `approval` | `approval`          |
| `approval` | `approval-settings` |
| `approval` | `approval-status`   |
| `company`  | `company`           |
| `company`  | `employee`          |
| `quote`    | `message`           |
| `quote`    | `quote`             |

## Key Capabilities & Integration Points

- **Package:** `@vicacha-devs/medusa-plugin-b2b`
- **Workflows:** `create-approval-settings`, `create-approvals`, `update-approval-settings`, `update-approval`, `add-company-to-customer-group`, `create-companies`, `delete-companies`, `remove-company-from-customer-group`, `update-companies`, `create-employees`, `delete-employees`, `update-employees`, `cart-created`, `order-created`, `validate-add-to-cart`, `validate-cart-completion`, `validate-update-cart`, `update-order`, `create-quote-message`, `create-quote`, `create-request-for-quote`, `customer-accept-quote`, `customer-reject-quote`, `merchant-reject-quote`
- **Event Subscribers:** None
- **Scheduled Jobs:** `expire-quotes`
