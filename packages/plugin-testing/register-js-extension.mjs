// Maps ESM-style relative `./x.js` specifiers to their `./x.ts` / `./x.tsx`
// sources so offline `node --test` suites can run TypeScript sources directly.
// Register AFTER the package resolver (`--import` order): later hooks run first.
import { existsSync } from "node:fs"
import { registerHooks } from "node:module"
import { dirname, resolve as resolvePath } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.endsWith(".js") &&
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      context.parentURL?.startsWith("file:")
    ) {
      const parentDir = dirname(fileURLToPath(context.parentURL))
      const base = resolvePath(parentDir, specifier)
      if (!existsSync(base)) {
        const stem = base.slice(0, -3)
        for (const ext of [".ts", ".tsx"]) {
          if (existsSync(stem + ext)) {
            return nextResolve(pathToFileURL(stem + ext).href, context)
          }
        }
      }
    }
    return nextResolve(specifier, context)
  },
})
