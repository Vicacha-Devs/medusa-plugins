---
title: "EU & Benelux Fulfillment — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-fulfillment-eu."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-fulfillment-eu
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-fulfillment-eu",
      options: {},
    },
  ],
})
```

## Admin UI Extensions

### Admin Routes

- No custom Admin UI pages registered.

### Admin Widgets

- No Admin UI widgets registered.

### Supported Admin Locales

`en`

## API Reference

This plugin registers Medusa v2 providers/middlewares without custom HTTP route files.
