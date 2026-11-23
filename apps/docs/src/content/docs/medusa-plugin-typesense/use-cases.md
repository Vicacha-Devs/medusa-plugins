---
title: "Typesense Search & AI Hybrid — Data Models & Use Cases"
description: "Medusa v2 modules, data models, architecture diagram, and use cases for @vicacha-devs/medusa-plugin-typesense."
---

Typesense search indexing, vector/hybrid AI search, merchandising (synonyms, curations, stopwords), custom entity indexing, and InstantSearch storefront SDK.

## Architecture Overview

```mermaid
flowchart LR
  Storefront["Storefront / Client"] -->|"12 Store API routes"| Plugin["@vicacha-devs/medusa-plugin-typesense"]
  Admin["Medusa Admin UI (6 pages)"] -->|"23 Admin API routes"| Plugin
  Plugin --> Modules["Medusa Modules (typesense)"]
  Plugin --> Workflows["Workflows (3)"]
  Plugin --> Providers["Providers (typesense)"]
```

## Medusa Modules & Data Models

| Module | Data Model |
| :--- | :--- |
| `typesense` | `entity-config` |
| `typesense` | `search-analytics` |
| `typesense` | `sync-job` |

## Key Capabilities & Integration Points

- **Package:** `@vicacha-devs/medusa-plugin-typesense`
- **Workflows:** `delete-documents`, `sync-entities`, `upsert-documents`
- **Event Subscribers:** `category-sync`, `collection-sync`, `product-sync`
- **Scheduled Jobs:** `typesense-nightly-reconcile`
