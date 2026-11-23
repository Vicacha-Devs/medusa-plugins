---
title: "Küresel Elektronik Faturalama"
description: "EU Peppol EN 16931, Kolombiya DIAN, Meksika CFDI 4.0 ve Genel UBL 2.1 sürücüleri ile ülkeye bağlı olmayan Medusa v2 e-fatura eklentisi."
---

EU Peppol EN 16931, Kolombiya DIAN, Meksika CFDI 4.0 ve Genel UBL 2.1 sürücüleri ile ülkeye bağlı olmayan Medusa v2 e-fatura eklentisi.

## Hızlı Kurulum

```bash
pnpm add @vicacha-devs/medusa-plugin-einvoicing
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-plugin-einvoicing",
      options: {},
    },
  ],
})
```

## Tam Dokümantasyon

- [Overview (EN)](/medusa-plugin-einvoicing/)
- [Data Models & Use Cases](/medusa-plugin-einvoicing/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-einvoicing/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-einvoicing/api/) (5 endpoints)
