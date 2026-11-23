---
title: "Commercial PDF Documents — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-plugin-documents."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-documents
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils";

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-documents",
      options: {},
    },
  ],
});
```

## Admin UI Extensions

### Admin Routes
- `/app/documents/@bulk-generate`
- `/app/documents`
- `/app/documents/settings`

### Admin Widgets
- `order-documents-widget`

### Supported Admin Locales
`ar`, `de`, `en`, `es`, `fr`, `it`, `nl`, `pl`, `pt`, `tr`

## API Reference

This plugin exposes **31 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-plugin-documents/api/).
