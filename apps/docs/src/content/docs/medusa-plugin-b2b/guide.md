---
title: "B2B Companies & Quotes — Developer Guide"
description: "Installation, medusa-config.ts setup, Admin UI routes, and developer guide for @vicacha-devs/medusa-plugin-b2b."
---

## Installation

```bash
pnpm add @vicacha-devs/medusa-plugin-b2b
```

## `medusa-config.ts` Registration

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-b2b",
      options: {},
    },
  ],
})
```

## Admin UI Extensions

### Admin Routes

- `/app/b2b/approvals`
- `/app/b2b/companies/@create`
- `/app/b2b/companies/[id]/@approval-settings`
- `/app/b2b/companies/[id]/@customer-group`
- `/app/b2b/companies/[id]/@edit`
- `/app/b2b/companies/[id]/@employee/[employeeId]`
- `/app/b2b/companies/[id]/@employee/create`
- `/app/b2b/companies/[id]`
- `/app/b2b/companies`
- `/app/b2b`
- `/app/b2b/quotes/[id]/manage`
- `/app/b2b/quotes/[id]`
- `/app/b2b/quotes`

### Admin Widgets

- `customer-company-widget`
- `customer-employee-widget`
- `customer-group-companies-widget`

### Supported Admin Locales

`ar`, `de`, `en`, `es`, `fr`, `it`, `nl`, `pl`, `pt`, `tr`

## API Reference

This plugin exposes **49 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-plugin-b2b/api/).
