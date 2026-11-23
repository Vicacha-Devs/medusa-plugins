---
title: "Global E-Invoicing (Peppol / DIAN / CFDI) — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-plugin-einvoicing."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-einvoicing
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-einvoicing",
      options: {},
    },
  ],
})
```

## Admin UI Extensions

### Admin Routes

- `/app/einvoicing`

### Admin Widgets

- No Admin UI widgets registered.

### Supported Admin Locales

`en`

## API Reference

This plugin exposes **5 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-plugin-einvoicing/api/).
