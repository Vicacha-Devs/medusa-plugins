---
title: "AB ve Benelüks Lojistik"
description: "PostNL, Sendcloud EU ve Rotterdam LCL palet taşımacılığı destekli Medusa v2 AB ve Benelüks lojistik sağlayıcısı."
---

PostNL, Sendcloud EU ve Rotterdam LCL palet taşımacılığı destekli Medusa v2 AB ve Benelüks lojistik sağlayıcısı.

## Hızlı Kurulum

```bash
pnpm add @vicacha-devs/medusa-fulfillment-eu
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-fulfillment-eu",
      options: {},
    },
  ],
});
```

## Tam Dokümantasyon

- [Overview (EN)](/medusa-fulfillment-eu/)
- [Data Models & Use Cases](/medusa-fulfillment-eu/use-cases/)
- [Developer Guide & Admin UI](/medusa-fulfillment-eu/guide/)

