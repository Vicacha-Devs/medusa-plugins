---
title: "Mollie & B2B Net-14 — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-payment-mollie."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-payment-mollie
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-payment-mollie",
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
