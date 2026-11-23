---
title: "Búsqueda Typesense e IA Híbrida"
description: "Indexación Typesense, búsqueda híbrida/vectorial con IA, merchandising (sinónimos, curaciones), entidades personalizadas y SDK InstantSearch."
---

Indexación Typesense, búsqueda híbrida/vectorial con IA, merchandising (sinónimos, curaciones), entidades personalizadas y SDK InstantSearch.

## Instalación Rápida

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

## Documentación Completa

- [Overview (EN)](/medusa-plugin-typesense/)
- [Data Models & Use Cases](/medusa-plugin-typesense/use-cases/)
- [Developer Guide & Admin UI](/medusa-plugin-typesense/guide/)
- [Interactive OpenAPI Reference](/medusa-plugin-typesense/api/) (35 endpoints)
