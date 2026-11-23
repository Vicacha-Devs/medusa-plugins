# Medusa Core Migrations & Side-Effects Register (`@vicacha-devs/medusa-v2-extensions`)

Chronological log of every Medusa core upgrade applied to this plugin monorepo, including breaking changes, silent pitfalls, side-effect warnings, and rollback procedures.

> **How to use this file**: Add a new section for every Medusa core upgrade, pair it with a `.changeset/*.md` file for published plugin changelogs, and run `pnpm qa:doctor` + `pnpm qa:verify` to enforce automated upgrade invariants.

---

## Upgrade Ledger

| Date         | Medusa Core        | `@medusajs/ui`   | Node Floor  | Plugins Covered                                                         | Risk Level                                    |
| :----------- | :----------------- | :--------------- | :---------- | :---------------------------------------------------------------------- | :-------------------------------------------- |
| `2026-11-21` | `2.22.7 -> 2.23.0` | `4.2.4 -> 4.3.0` | `>=22.22.0` | All 12 publishable plugins + `shared` + `apps/sandbox`                  | **HIGH (Coordinated Major Deps)**             |
| `2026-11-21` | `2.21.0 -> 2.22.7` | `4.2.4`          | `>=22.22.0` | All publishable plugins + `shared` + `apps/sandbox`                     | Medium (Index Module deprecated, Node 20 EOL) |
| `2026-11-20` | `2.19.0 / 2.21.0`  | `4.2.1 / 4.2.4`  | `>=22.12.0` | Initial 11-plugin monorepo sync (`Vicacha-Devs/vicacha-medusa-plugins`) | Low                                           |

---

## `v2.22.7 -> v2.23.0` (2026-11-21) — Express 5, React 19, Vite 8, Tailwind CSS 4, TanStack Table v9

### Coordinated Dependency Set (Must Move Together)

- `@medusajs/*`: `2.23.0` · `@medusajs/ui`: `4.3.0`
- `react` & `react-dom`: `^19.3.1` (exact — **never widen to `^18 || ^19`**)
- `@types/react` & `@types/react-dom`: `^19.3.0`
- `vite`: `^8.3.8` · `@tanstack/react-query`: `5.107.1` · `@tanstack/react-table`: `9.3.1`
- `react-i18next`: `18.0.1` · `i18next`: `27.1.1` · `react-router-dom`: `7.18.5` · `zod`: `4.6.7` · `react-hook-form`: `7.92.0`

### Side Effects & Breaking-Change Warnings

> [!WARNING]
> **1. Dual React / Vite Copies Fail Silently at Runtime**: Installing a plugin or third-party extension that pins React 18 or Vite 7 installs two copies and breaks Medusa Admin widgets with `"Invalid hook call"` in the browser. Always verify single copies with `pnpm qa:doctor` (`node ./scripts/qa/doctor.ts`) or `pnpm why react react-dom vite`.

> [!WARNING]
> **2. Mandatory Admin Rebuild for Every Plugin**: Vite 8 (Rolldown + Oxc) replaced Rollup + esbuild. Every plugin shipping `src/admin/` MUST be rebuilt with `medusa plugin:build` (and `packages/shared` with `pnpm build` using `oxc` + `rolldownOptions`) before host apps consume it.

> [!CAUTION]
> **3. RBAC Policy Expansion**: Medusa `v2.23.0` adds dedicated RBAC policies for admin-wide operations (`search_index:read`, `search_index:delete`, `search_index_sync:create`, `index_engine:update`, `workflow_execution:create`, `view_configuration`, `layout_configuration`). Existing roles using operation wildcards (`*:create`, `*:update`, `*:delete`) now match these policies automatically. Review role assignments in host apps — never silently auto-mutate production roles.

> [!IMPORTANT]
> **4. Silent Visual & Hook Regressions to Verify Manually**:
>
> - **Tailwind CSS 4**: Legacy Tailwind 3 utilities (`outline-none`, `flex-shrink-0`, `flex-grow`, `rounded`) do not throw build errors — they render differently or disappear silently. Audited & renamed in `packages/b2b`, `packages/shared`, and `packages/stories`; visually inspect all plugin Admin routes/widgets after boot.
> - **TanStack Table v9 & React 19 Types**: `@tanstack/react-table@9.3.1` removed `useReactTable` and `get*RowModel` from the root entry. `packages/shared` (`useDataTable`, `DataTableRoot`, `DataTable`) and legacy column definitions now import `useLegacyTable`, `legacyCreateColumnHelper`, and `Legacy*` types from `@tanstack/react-table/legacy` with `TData extends RowData`; `@medusajs/ui` `DataTable` columns (`b2b` `manage-items-table`) now use `createDataTableColumnHelper`. Explicit `import type { JSX } from "react"` added where React 19 removed the global `JSX` namespace.
> - **TanStack Query 4-Arg Callbacks**: `onSuccess`/`onError`/`onSettled` now receive `(data, variables, onMutateResult, context)`. All forwarding hooks in `packages/b2b`, `packages/payment-bold`, and `packages/shared` updated to 4 args.
> - **i18next 27 / react-i18next 18**: Uninitialized `i18next` instances return `""` instead of `undefined` (blank labels); always use `useTranslation()` or `getI18n()`. Empty translations now fall back to English.
> - **Express 5**: String `matcher`s with `(`, `|`, `?`, `+` throw `path-to-regexp` errors at startup; `/x/*` `bodyParser` / `additionalDataValidator` configs no longer match `/x` itself. Audited across all 12 plugins (clean).

### Rollback Procedure

- Local Git rollback: `git status` / `git checkout -- .` (or restore from the pre-migration backup snapshot) and run `pnpm install` + `pnpm build`.
- Note: Do **not** downgrade a Redis/Valkey instance that has already run Medusa `2.23.0` (BullMQ 6 Job Scheduler format is one-way).
