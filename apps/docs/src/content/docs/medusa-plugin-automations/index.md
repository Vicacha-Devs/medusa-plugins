---
title: "Automations & Rule Engine"
description: "Automations plugin for Medusa v2 by Vicacha Devs."
---

> **Package:** `@vicacha-devs/medusa-plugin-automations` · **Version:** `0.1.0` · **Category:** Engagement & Growth

## Package Snapshot

| Capability                | Details                                                  |
| :------------------------ | :------------------------------------------------------- |
| Medusa Modules / Models   | 1 modules / 2 data models                                |
| Workflows                 | 0                                                        |
| Subscribers / Jobs        | 1 subscribers / 0 scheduled jobs                         |
| Providers                 | —                                                        |
| Admin UI Routes / Widgets | 1 routes / 0 widgets                                     |
| Admin i18n Locales        | en                                                       |
| HTTP Endpoints            | 8 ([OpenAPI Reference](/medusa-plugin-automations/api/)) |

Rule-based **trigger → condition → action** automation engine for **Medusa v2** (`>= 2.23.0`).

- **Triggers**: Commerce events (`order.placed`, `order.completed`, `customer.created`, `inventory-level.updated`, etc.), scheduled rules, and manual triggers (`POST /admin/automations/:id/trigger`).
- **Condition Engine**: Prototype-safe nested path evaluation (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `not_in`, `contains`, `not_contains`, `exists`, `not_exists`).
- **Action Handlers**:
  - `notification`: Dispatches via Medusa's built-in `Modules.NOTIFICATION`.
  - `mpn-notification-studio`: Optional zero-hard-dependency integration with `@vicacha-devs/medusa-plugin-notifications`.
  - `webhook`: SSRF-guarded outgoing JSON webhook POST.
  - Extensible via `registerActionHandler()` or `options.actionHandlers`.

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-automations
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-automations",
      options: {},
    },
  ],
})
```
