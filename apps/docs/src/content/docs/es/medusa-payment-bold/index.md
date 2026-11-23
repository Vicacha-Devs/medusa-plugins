---
title: "Pagos Bold Colombia"
description: "Suite de pagos Bold Colombia de 4 canales (Botón, Links, API Online Tarjetas/PSE/Nequi/QR y Datáfonos Smart POS) con emulador QA."
---

Suite de pagos Bold Colombia de 4 canales (Botón, Links, API Online Tarjetas/PSE/Nequi/QR y Datáfonos Smart POS) con emulador QA.

## Instalación Rápida

```bash
pnpm add @vicacha-devs/medusa-payment-bold
```

```ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "@vicacha-devs/medusa-payment-bold",
      options: {},
    },
  ],
})
```

## Documentación Completa

- [Overview (EN)](/medusa-payment-bold/)
- [Data Models & Use Cases](/medusa-payment-bold/use-cases/)
- [Developer Guide & Admin UI](/medusa-payment-bold/guide/)
- [Interactive OpenAPI Reference](/medusa-payment-bold/api/) (14 endpoints)
