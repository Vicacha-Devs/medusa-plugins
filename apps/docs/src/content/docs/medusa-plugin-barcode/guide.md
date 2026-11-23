---
title: "Barcode, GS1 & Stock-Take — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-plugin-barcode."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-barcode
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils";

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-barcode",
      options: {},
    },
  ],
});
```

## Admin UI Extensions

### Admin Routes
- `/app/barcodes/lookup`
- `/app/barcodes`
- `/app/barcodes/print`
- `/app/barcodes/providers`
- `/app/barcodes/stock-take`
- `/app/barcodes/tags/@create`
- `/app/barcodes/tags`

### Admin Widgets
- `product-barcode-widget`

### Supported Admin Locales
`ar`, `de`, `en`, `es`, `fr`, `it`, `nl`, `pl`, `pt`, `tr`

## API Reference

This plugin exposes **29 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-plugin-barcode/api/).
