---
title: "Otomasyonlar ve Kural Motoru"
description: "Medusa v2 için kural tabanlı tetikleyici → koşul → eylem otomasyon motoru, iç içe koşul değerlendirme ve Bildirim/Webhook işleyicileri."
---

Medusa v2 için kural tabanlı tetikleyici → koşul → eylem otomasyon motoru, iç içe koşul değerlendirme ve Bildirim/Webhook işleyicileri.

## Hızlı Kurulum

```bash
pnpm add @vicacha-devs/medusa-plugin-automations
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-automations",
      options: {},
    },
  ],
})
```

## Tam Dokümantasyon

- [Overview (EN)](/medusa-plugin-automations/)
- [Data Models & Use Cases](/medusa-plugin-automations/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-automations/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-automations/api/) (8 endpoints)
