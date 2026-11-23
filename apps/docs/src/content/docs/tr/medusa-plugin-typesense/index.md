---
title: "Typesense Arama ve Yapay Zeka Hibrit"
description: "Typesense indeksleme, vektör/hibrit yapay zeka araması, eşanlamlılar, kürasyonlar ve InstantSearch mağaza SDK'sı."
---

Typesense indeksleme, vektör/hibrit yapay zeka araması, eşanlamlılar, kürasyonlar ve InstantSearch mağaza SDK'sı.

## Hızlı Kurulum

```bash
pnpm add @vicacha-devs/medusa-plugin-typesense
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-typesense",
      options: {},
    },
  ],
});
```

## Tam Dokümantasyon

- [Overview (EN)](/medusa-plugin-typesense/)
- [Data Models & Use Cases](/medusa-plugin-typesense/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-typesense/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-typesense/api/) (35 endpoints)
