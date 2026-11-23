# `@vicacha-devs/medusa-plugin-testing`

Internal zero-dependency Node.js test harness enabling fast offline `node --test` execution for Medusa v2 plugins in `@vicacha-devs/medusa-v2-extensions` — even before `pnpm install` or PostgreSQL setup.

---

## Exports

| Subpath                                        | File                                                     | Purpose                                                                                                                                                                                                                    |
| :--------------------------------------------- | :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@vicacha-devs/medusa-plugin-testing/register` | [`register-ts-resolver.mjs`](./register-ts-resolver.mjs) | Node.js `module.registerHooks` loader that strips TypeScript syntax on the fly, resolves extensionless relative `.ts`/`.tsx`/`index.ts` imports, and redirects `@medusajs/*`, `react`, and `zod` imports to the local shim |
| `@vicacha-devs/medusa-plugin-testing/shim`     | [`medusa-shim.mjs`](./medusa-shim.mjs)                   | Lightweight Medusa v2 DML (`model.define`), `Modules`, `MedusaService`, workflow/step builders, and utility stubs for deterministic offline unit/contract tests                                                            |

---

## Usage in a Plugin `package.json`

```json
{
  "scripts": {
    "test": "node --import ../plugin-testing/register-ts-resolver.mjs --test src/__tests__/*.spec.ts"
  }
}
```

> Plugins that need full runtime validation (such as Zod schema validation or payment provider base classes in `medusa-plugin-payment-bold`) can pair a plugin-local shim/resolver alongside this shared baseline.
