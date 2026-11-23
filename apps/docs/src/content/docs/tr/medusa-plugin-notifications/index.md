---
title: "Çok Kanallı Bildirimler"
description: "Görsel şablon oluşturucu, olay eşleme, onay defteri, terk edilmiş sepet kurtarma ve çoklu kanal sağlayıcıları."
---

Görsel şablon oluşturucu, olay eşleme, onay defteri, terk edilmiş sepet kurtarma ve çoklu kanal sağlayıcıları.

## Hızlı Kurulum

```bash
pnpm add @vicacha-devs/medusa-plugin-notifications
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-notifications",
      options: {},
    },
  ],
});
```

## Tam Dokümantasyon

- [Overview (EN)](/medusa-plugin-notifications/)
- [Data Models & Use Cases](/medusa-plugin-notifications/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-notifications/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-notifications/api/) (22 endpoints)
