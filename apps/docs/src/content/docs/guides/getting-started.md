---
title: Getting Started
description: Install and configure @vicacha-devs Medusa v2 plugins in your Medusa v2 application or run the monorepo sandbox locally.
---

## Installing Plugins in Your Medusa v2 App

Each plugin is published independently under `@vicacha-devs/*` on npm. Install only the plugins you need:

```bash
pnpm add @vicacha-devs/medusa-plugin-b2b @vicacha-devs/medusa-plugin-documents
```

Register them in your `medusa-config.ts`:

```ts
import { defineConfig } from "@medusajs/framework/utils";

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-b2b",
      options: {},
    },
    {
      resolve: "@vicacha-devs/medusa-plugin-documents",
      options: {},
    },
  ],
});
```

Run database migrations after adding plugins that define Medusa Modules:

```bash
npx medusa db:migrate
```

## Running the Monorepo Locally

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Build all packages
pnpm build

# 3. Run offline QA doctor, judges, publint & all plugin test suites
pnpm qa:verify
```

### Port-Isolated Docker QA Stack

Copy `.env.qa.example` to `.env.qa` and start the loopback-only (`127.0.0.1`) Docker stack:

```bash
pnpm qa:docker:up
pnpm qa:smoke
pnpm qa:e2e
pnpm qa:docker:down
```
