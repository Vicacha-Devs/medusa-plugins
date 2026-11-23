---
title: "EU & Benelux Fulfillment"
description: "EU & Benelux fulfillment provider plugin for Medusa v2 (PostNL letterbox, Sendcloud EU parcel, and Rotterdam LCL pallet freight)."
---

> **Package:** `@vicacha-devs/medusa-fulfillment-eu` · **Version:** `0.0.1` · **Category:** Operations & Fulfillment

## Package Snapshot

| Capability | Details |
| :--- | :--- |
| Medusa Modules / Models | 0 modules / 0 data models |
| Workflows | 0 |
| Subscribers / Jobs | 0 subscribers / 0 scheduled jobs |
| Providers | eu-fulfillment |
| Admin UI Routes / Widgets | 0 routes / 0 widgets |
| Admin i18n Locales | en |
| HTTP Endpoints | Provider / Middleware-only (no custom HTTP routes) |

EU & Benelux fulfillment provider plugin for Medusa v2 (PostNL letterbox, Sendcloud EU parcel, and Rotterdam LCL pallet freight).

## Installation

```bash
pnpm add @vicacha-devs/medusa-fulfillment-eu
```

Register the plugin in `medusa-config.ts`:

```ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-fulfillment-eu",
      options: {},
    },
  ],
});
```
