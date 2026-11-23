---
title: "Shoppable Stories & Reels — Data Models & Use Cases"
description: "Medusa v2 modules, data models, architecture diagram, and use cases for @vicacha-devs/medusa-plugin-stories."
---

Shoppable 9:16 stories, highlight rings, X/Y product hotspots, interactive stickers (polls, countdowns, coupons), funnel analytics, and Storefront React UI Kit.

## Architecture Overview

```mermaid
flowchart LR
  Storefront["Storefront / Client"] -->|"4 Store API routes"| Plugin["@vicacha-devs/medusa-plugin-stories"]
  Admin["Medusa Admin UI (6 pages)"] -->|"17 Admin API routes"| Plugin
  Plugin --> Modules["Medusa Modules (stories, story)"]
```

## Medusa Modules & Data Models

| Module    | Data Model              |
| :-------- | :---------------------- |
| `stories` | _(service-only module)_ |
| `story`   | _(service-only module)_ |

## Key Capabilities & Integration Points

- **Package:** `@vicacha-devs/medusa-plugin-stories`
- **Workflows:** None
- **Event Subscribers:** `product-deleted`
- **Scheduled Jobs:** `expire-ephemeral-stories`
