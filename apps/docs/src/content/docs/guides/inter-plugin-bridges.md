---
title: Inter-Plugin Bridges
description: How @vicacha-devs Medusa v2 plugins compose cleanly across B2B, DIAN electronic invoicing, PDF documents, and RBAC.
---

Plugins in this suite are designed to work standalone **and** compose seamlessly when installed together:

```mermaid
flowchart LR
  B2B["@vicacha-devs/medusa-plugin-b2b"] -->|"Legal client fiscal profile"| DIAN["@vicacha-devs/medusa-plugin-dian"]
  B2B -->|"Company & quote context"| Docs["@vicacha-devs/medusa-plugin-documents"]
  DIAN -->|"PDF Representación Gráfica"| Docs
  Docs -->|"PDF email/WhatsApp attachments"| Notif["@vicacha-devs/medusa-plugin-notifications"]
```

## Key Bridges

1. **DIAN ↔ B2B & Documents**:
   - Reads B2B legal client fiscal profiles from `@vicacha-devs/medusa-plugin-b2b` when issuing electronic invoices.
   - Delegates PDF *Representación Gráfica* rendering to `@vicacha-devs/medusa-plugin-documents`.
2. **Documents ↔ B2B & Notifications**:
   - Enriches invoices, quotes, and packing slips with B2B company tax IDs and billing metadata when `@vicacha-devs/medusa-plugin-b2b` is active.
   - Attaches generated PDF invoices and receipts to Email, WhatsApp, and Telegram dispatches in `@vicacha-devs/medusa-plugin-notifications`.
3. **Shared Admin UI**:
   - Plugins consume `@vicacha-devs/medusa-shared-admin` for consistent DataTables, filter chips, media uploaders, and shared hooks.
