---
title: "DIAN Electronic Invoicing — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-plugin-dian."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-dian
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-dian",
      options: {},
    },
  ],
})
```

## Admin UI Extensions

### Admin Routes

- `/app/dian/fiscal-profiles`
- `/app/dian`
- `/app/dian/resolutions`
- `/app/settings/dian`

### Admin Widgets

- `order-dian-widget`

### Supported Admin Locales

`ar`, `de`, `en`, `es`, `fr`, `it`, `nl`, `pl`, `pt`, `tr`

## API Reference

This plugin exposes **13 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-plugin-dian/api/).
