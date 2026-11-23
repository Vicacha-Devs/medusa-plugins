---
title: "Odoo ERP Bidirectional Sync — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-plugin-odoo."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-odoo
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-odoo",
      options: {},
    },
  ],
})
```

## Admin UI Extensions

### Admin Routes

- `/app/odoo/barcode`
- `/app/odoo/connection`
- `/app/odoo/logs`
- `/app/odoo`
- `/app/odoo/settings`

### Admin Widgets

- `order-odoo-widget`
- `product-odoo-widget`

### Supported Admin Locales

`ar`, `de`, `en`, `es`, `fr`, `it`, `nl`, `pl`, `pt`, `tr`

## API Reference

This plugin exposes **23 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-plugin-odoo/api/).
