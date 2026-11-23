import { existsSync, statSync } from "node:fs"
import { registerHooks } from "node:module"
import { dirname, join, resolve as resolvePath } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const currentDir = dirname(fileURLToPath(import.meta.url))
const shimUrl = pathToFileURL(resolvePath(currentDir, "medusa-shim.mjs")).href

function resolveTs(base) {
  for (const c of [base, `${base}.ts`, join(base, "index.ts")]) {
    if (existsSync(c) && statSync(c).isFile()) return c
  }
  return null
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@medusajs/")) {
      return { url: shimUrl, shortCircuit: true }
    }
    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      context.parentURL
    ) {
      const matched = resolveTs(
        resolvePath(dirname(fileURLToPath(context.parentURL)), specifier)
      )
      if (matched) return nextResolve(pathToFileURL(matched).href, context)
    }
    return nextResolve(specifier, context)
  },
})
