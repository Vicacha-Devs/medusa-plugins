---
title: "Omnichannel Notifications — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-plugin-notifications."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-notifications
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-notifications",
      options: {},
    },
  ],
})
```

## Admin UI Extensions

### Admin Routes

- `/app/mpn/broadcasts`
- `/app/mpn/channels`
- `/app/mpn/logs`
- `/app/mpn/mappings`
- `/app/mpn`
- `/app/mpn/sandbox`
- `/app/mpn/templates`

### Admin Widgets

- `order-notifications-widget`

### Supported Admin Locales

`ar`, `de`, `en`, `es`, `fr`, `it`, `nl`, `pl`, `pt`, `tr`

## API Reference

This plugin exposes **22 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-plugin-notifications/api/).
