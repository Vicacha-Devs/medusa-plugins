---
title: "Automations & Rule Engine — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-plugin-automations."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-automations
```

## `medusa-config.ts` Registration

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

## Admin UI Extensions

### Admin Routes

- `/app/automations`

### Admin Widgets

- No Admin UI widgets registered.

### Supported Admin Locales

`en`

## API Reference

This plugin exposes **8 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-plugin-automations/api/).
