---
title: "DIAN Elektronik Faturalama"
description: "Kolombiya DIAN UBL 2.1 elektronik faturalama, CUFE/CUDE SHA-384, XAdES-EPES dijital imza ve takılabilir sağlayıcılar."
---

Kolombiya DIAN UBL 2.1 elektronik faturalama, CUFE/CUDE SHA-384, XAdES-EPES dijital imza ve takılabilir sağlayıcılar.

## Hızlı Kurulum

```bash
pnpm add @vicacha-devs/medusa-plugin-dian
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-dian",
      options: {},
    },
  ],
})
```

## Tam Dokümantasyon

- [Overview (EN)](/medusa-plugin-dian/)
- [Data Models & Use Cases](/medusa-plugin-dian/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-dian/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-dian/api/) (13 endpoints)
