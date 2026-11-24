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
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-stories",
      options: {},
    },
  ],
})
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

## How Shoppable 9:16 Stories Works

1. **Quick-Create from a Product (`product-stories-widget`):**
   - Clicking **+ Create Story From Product** on a product page calls `POST /admin/stories`.
   - **Picture:** Uses `product.thumbnail` from Medusa's **Product Media** (falling back to a default placeholder image if no thumbnail is uploaded).
   - **Text:** Populates `title` and hotspot `label` from `product.title`, `caption` from the localized `widget.featuredCaption` string, and `link_text` / `link_url` from `widget.shopProductLink` and `/products/${product.handle}`.
   - **Hotspot & Ring:** Pins one product hotspot at `(50%, 65%)` and links the slide to the first Highlight Ring (`groups[0]?.id ?? null`).
2. **Highlight Rings (`/app/stories/rings`):** Create and manage circular Highlight Rings (`RouteDrawer` at `@create`) scoped to storefront placement zones.
3. **Hotspot Canvas (`/app/stories/canvas`):** Publish 9:16 image/video slides and click the 9:16 phone preview to position `(x_percent, y_percent)` product hotspots.
4. **Stickers & Analytics (`/app/stories/stickers`, `/app/stories/analytics`):** Attach interactive Poll/Countdown/Coupon/Q&A stickers and inspect `impression` → `complete` → `hotspot_click` → `add_to_cart` conversion metrics.

## API Reference

This plugin exposes **21 HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/medusa-plugin-stories/api/).
