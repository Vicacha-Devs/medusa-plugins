---
title: "Ticari PDF Belgeleri"
description: "Çift PDF motoru, 10 dilde yerelleştirme ve Docuseal e-imza desteği ile fatura, irsaliye, kredi notu ve POS fişleri."
---

Çift PDF motoru, 10 dilde yerelleştirme ve Docuseal e-imza desteği ile fatura, irsaliye, kredi notu ve POS fişleri.

## Hızlı Kurulum

```bash
pnpm add @vicacha-devs/medusa-plugin-documents
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-documents",
      options: {},
    },
  ],
});
```

## Tam Dokümantasyon

- [Overview (EN)](/medusa-plugin-documents/)
- [Data Models & Use Cases](/medusa-plugin-documents/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-documents/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-documents/api/) (31 endpoints)
