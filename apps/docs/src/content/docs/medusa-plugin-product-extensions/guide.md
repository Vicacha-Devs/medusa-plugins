---
title: "Product Extensions Suite — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-plugin-product-extensions."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-product-extensions
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-product-extensions",
      options: {},
    },
  ],
})
```

## Admin UI Extensions

### Admin Routes

- `/app/product-ext/attributes/@create`
- `/app/product-ext/attributes`
- `/app/product-ext/features/@create`
- `/app/product-ext/features`
- `/app/product-ext/image-alts`
- `/app/product-ext`
- `/app/product-ext/templates/@create`
- `/app/product-ext/templates`
- `/app/product-ext/variant-media`

### Admin Widgets

- `category-attributes-widget`
- `product-ext-widget`

### Supported Admin Locales

`ar`, `de`, `en`, `es`, `fr`, `it`, `nl`, `pl`, `pt`, `tr`

## API Reference

This plugin exposes **25 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-plugin-product-extensions/api/).
