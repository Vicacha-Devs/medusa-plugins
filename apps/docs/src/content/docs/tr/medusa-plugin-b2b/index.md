---
title: "B2B Şirketler ve Teklifler"
description: "Medusa v2 için B2B şirketler, çalışan hiyerarşileri, onay kuralları, harcama limitleri ve teklif müzakere iş akışları."
---

Medusa v2 için B2B şirketler, çalışan hiyerarşileri, onay kuralları, harcama limitleri ve teklif müzakere iş akışları.

## Hızlı Kurulum

```bash
pnpm add @vicacha-devs/medusa-plugin-b2b
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-b2b",
      options: {},
    },
  ],
})
```

## Tam Dokümantasyon

- [Overview (EN)](/medusa-plugin-b2b/)
- [Data Models & Use Cases](/medusa-plugin-b2b/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-b2b/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-b2b/api/) (49 endpoints)
