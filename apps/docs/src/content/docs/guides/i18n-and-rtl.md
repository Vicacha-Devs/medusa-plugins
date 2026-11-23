---
title: Admin i18n & RTL
description: Multi-locale Admin UI translations and RTL layout support across @vicacha-devs Medusa v2 plugins.
---

Plugins with Admin UI extensions ship translation catalogs under `src/admin/i18n/json/*.json`, supporting up to **10+ locales** including right-to-left (`ar`) layouts:

- **Primary Locales**: `en`, `es`, `ar` (RTL), `tr`
- **Extended European Locales**: `fr`, `de`, `pt`, `it`, `nl`, `pl`

## Key Parity & QA Enforcement

`pnpm qa:judges` checks i18n key parity across translation files so missing or drifted translation keys are caught in CI before release.

## Documentation Localization

This documentation site mirrors the core suite locales (`en`, `es`, `ar` with `dir: "rtl"`, and `tr`) while keeping code blocks and Pele architecture diagrams left-to-right (`LTR`) for readability.
