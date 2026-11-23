---
title: "Sosyal Ticaret ve Canlı Satış"
description: "TikTok, Instagram ve Meta Graph API için çok platformlu sosyal ticaret, canlı satış oturumları ve katalog senkronizasyonu."
---

TikTok, Instagram ve Meta Graph API için çok platformlu sosyal ticaret, canlı satış oturumları ve katalog senkronizasyonu.

## Hızlı Kurulum

```bash
pnpm add @vicacha-devs/medusa-plugin-social-commerce
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-social-commerce",
      options: {},
    },
  ],
})
```

## Tam Dokümantasyon

- [Overview (EN)](/medusa-plugin-social-commerce/)
- [Data Models & Use Cases](/medusa-plugin-social-commerce/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-social-commerce/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-social-commerce/api/) (35 endpoints)
