---
title: "Typesense Search & AI Hybrid — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-plugin-typesense."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-typesense
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils";

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-typesense",
      options: {},
    },
  ],
});
```

## Admin UI Extensions

### Admin Routes
- `/app/typesense/analytics`
- `/app/typesense/collections`
- `/app/typesense/entities`
- `/app/typesense/merchandising`
- `/app/typesense`
- `/app/typesense/playground`

### Admin Widgets
- `product-typesense-widget`

### Supported Admin Locales
`ar`, `de`, `en`, `es`, `fr`, `it`, `nl`, `pl`, `pt`, `tr`

## API Reference

This plugin exposes **35 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-plugin-typesense/api/).
