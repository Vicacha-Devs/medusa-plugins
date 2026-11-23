---
title: "Shoppable Stories & Reels — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-plugin-stories."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-stories
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils";

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-stories",
      options: {},
    },
  ],
});
```

## Admin UI Extensions

### Admin Routes
- `/app/stories/analytics`
- `/app/stories/canvas`
- `/app/stories`
- `/app/stories/rings/@create`
- `/app/stories/rings`
- `/app/stories/stickers`

### Admin Widgets
- `product-stories-widget`

### Supported Admin Locales
`ar`, `de`, `en`, `es`, `fr`, `it`, `nl`, `pl`, `pt`, `tr`

## API Reference

This plugin exposes **21 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-plugin-stories/api/).
