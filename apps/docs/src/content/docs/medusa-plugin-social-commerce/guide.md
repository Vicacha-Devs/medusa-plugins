---
title: "Social Commerce & Live Selling — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-plugin-social-commerce."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-social-commerce
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-social-commerce",
      options: {},
    },
  ],
})
```

## Admin UI Extensions

### Admin Routes

- `/app/social-commerce/accounts`
- `/app/social-commerce/catalog`
- `/app/social-commerce/feed`
- `/app/social-commerce/live/@create`
- `/app/social-commerce/live`
- `/app/social-commerce`
- `/app/social-commerce/stories/@create`
- `/app/social-commerce/stories`

### Admin Widgets

- `product-social-widget`

### Supported Admin Locales

`ar`, `de`, `en`, `es`, `fr`, `it`, `nl`, `pl`, `pt`, `tr`

## API Reference

This plugin exposes **35 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-plugin-social-commerce/api/).
