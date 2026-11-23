---
title: Contributing & Scaffolding
description: How to scaffold a new Medusa v2 plugin, follow commit conventions, and update documentation.
---

## Scaffolding a New Plugin

Use the built-in scaffolder CLI to generate a compliant Medusa v2 plugin with tests, i18n, routes, workflow, and sandbox wiring:

```bash
pnpm plugin:new -- loyalty-points --display-name "Loyalty Points" --wire-sandbox
```

Preview changes without writing files:

```bash
pnpm plugin:new -- loyalty-points --dry-run
```

## Updating Documentation

1. Edit the plugin's `README.md` or `src/api/**/route.ts` endpoints.
2. If adding a new publishable plugin, add its metadata entry to `apps/docs/docs-packages.ts`.
3. Preview locally:

```bash
pnpm docs:dev
```

## Commit & Release Workflow

- Commits follow **Conventional Commits** validated by `commitlint`.
- Add a changeset with `pnpm changeset` for any publishable plugin change.
- Run `pnpm qa:verify` before opening a pull request.
