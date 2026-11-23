---
title: "Bold Colombia Payments — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-payment-bold."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-payment-bold
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-payment-bold",
      options: {},
    },
  ],
})
```

## Admin UI Extensions

### Admin Routes

- `/app/settings/bold`

### Admin Widgets

- `bold-audit-timeline`
- `bold-payment-actions`
- `bold-payment-tabs`
- `bold-remote-payment-panel`
- `bold-terminal-section`
- `bold-order-balance.ts`
- `use-bold-widget-state`
- `bold-refund-actions`
- `index.ts`

### Supported Admin Locales

`ar`, `en`, `es`, `tr`

## API Reference

This plugin exposes **14 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-payment-bold/api/).
