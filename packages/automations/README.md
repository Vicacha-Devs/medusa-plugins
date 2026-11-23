# `@vicacha-devs/medusa-plugin-automations`

Rule-based **trigger → condition → action** automation engine for **Medusa v2** (`>= 2.23.0`), built as an ESM-only package with an optional zero-hard-dependency bridge to `@vicacha-devs/medusa-plugin-notifications`.

---

## Key Features

- **Triggers**:
  - **Commerce Events**: `order.placed`, `order.completed`, `order.canceled`, `customer.created`, `product.created`, `product.updated`, `inventory-level.updated` (via `src/subscribers/automation-events.ts`).
  - **Scheduled & Manual Triggers**: Cron-ready rule definitions plus manual execution via `POST /admin/automations/:id/trigger`.
- **Prototype-Safe Condition Evaluator (`evaluateConditions`)**:
  - Resolves nested dot/array paths (`order.total`, `order.items.0.sku`, `customer.tags`) while blocking `__proto__`, `constructor`, and `prototype`.
  - Supports 12 operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `not_in`, `contains`, `not_contains`, `exists`, `not_exists`.
- **Built-in & Extensible Action Handlers (`AutomationActionHandler`)**:
  - `notification`: Dispatches via Medusa's built-in `Modules.NOTIFICATION` (`email`, `sms`, `whatsapp`, `telegram`, `slack`).
  - `mpn-notification-studio`: Optional bridge to `@vicacha-devs/medusa-plugin-notifications` (falls back to `Modules.NOTIFICATION` when standalone).
  - `webhook`: SSRF-guarded outgoing JSON `POST` (`https://` in production; loopback allowed in non-production).
  - Register custom handlers via `service.registerActionHandler(handler)` or `options.actionHandlers`.

---

## Installation & Configuration

```bash
pnpm add @vicacha-devs/medusa-plugin-automations
```

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-automations",
      options: {},
    },
  ],
})
```

---

## Data Models & REST API

- **Models**: `automation_rule` (`AutomationRuleModel`) and `automation_execution_log` (`AutomationExecutionLogModel`).
- **Admin Endpoints**:
  - `GET /admin/automations` · `POST /admin/automations`
  - `GET /admin/automations/:id` · `PATCH /admin/automations/:id` · `DELETE /admin/automations/:id`
  - `POST /admin/automations/:id/trigger`
  - `GET /admin/automations/:id/logs`
  - `GET /admin/automations/actions`
- **Admin UI**: `/app/automations` route for viewing, toggling, and manually triggering rules.

---

## Development & Testing

```bash
pnpm --filter @vicacha-devs/medusa-plugin-automations test
pnpm --filter @vicacha-devs/medusa-plugin-automations typecheck
```
