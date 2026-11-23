---
title: "Social Commerce & Live Selling — Data Models & Use Cases"
description: "Medusa v2 modules, data models, architecture diagram, and use cases for @vicacha-devs/medusa-plugin-social-commerce."
---

Multi-platform Social Commerce, live selling sessions, product tagging, and catalog sync for TikTok, Instagram, and Facebook / Meta Graph API.

## Architecture Overview

```mermaid
flowchart LR
  Storefront["Storefront / Client"] -->|"9 Store API routes"| Plugin["@vicacha-devs/medusa-plugin-social-commerce"]
  Admin["Medusa Admin UI (8 pages)"] -->|"20 Admin API routes"| Plugin
  Plugin --> Modules["Medusa Modules (social-commerce)"]
  Plugin --> Workflows["Workflows (6)"]
  External["External Gateway"] -->|"4 Webhooks"| Plugin
```

## Medusa Modules & Data Models

| Module | Data Model |
| :--- | :--- |
| `social-commerce` | `catalog-sync-item` |
| `social-commerce` | `live-product` |
| `social-commerce` | `live-session` |
| `social-commerce` | `social-account` |
| `social-commerce` | `social-media-post` |
| `social-commerce` | `social-product-tag` |

## Key Capabilities & Integration Points

- **Package:** `@vicacha-devs/medusa-plugin-social-commerce`
- **Workflows:** `account-connected.workflow`, `catalog-sync.workflow`, `checkout-handoff.workflow`, `live-ended.workflow`, `live-started.workflow`, `media-synced.workflow`
- **Event Subscribers:** `order-placed.subscriber`, `product-sync.subscriber`, `social-events.subscriber`
- **Scheduled Jobs:** `cleanup-reservations-and-sync-catalog.job`, `sync-social-media-and-tokens.job`
