import { existsSync, readFileSync, statSync } from "node:fs"
import * as nodeModule from "node:module"
import { dirname, join, resolve as resolvePath } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const { registerHooks, stripTypeScriptTypes } = nodeModule
const currentDir = dirname(fileURLToPath(import.meta.url))
const srcDir = resolvePath(currentDir, "..")
const shimUrl = pathToFileURL(
  resolvePath(currentDir, "medusa-payment-shim.mjs")
).href

function resolveTsCandidate(baseCandidate) {
  const candidates = [
    baseCandidate,
    `${baseCandidate}.ts`,
    `${baseCandidate}.tsx`,
    `${baseCandidate}.json`,
    join(baseCandidate, "index.ts"),
    join(baseCandidate, "index.tsx"),
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate
    }
  }
  return null
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@medusajs/") || specifier === "zod") {
      return { url: shimUrl, shortCircuit: true }
    }

    if (specifier.startsWith("@payment-bold/")) {
      const subPath = specifier.slice("@payment-bold/".length)
      const matched = resolveTsCandidate(join(srcDir, subPath))
      if (matched) {
        return nextResolve(pathToFileURL(matched).href, context)
      }
    }

    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      context.parentURL
    ) {
      const parentDir = dirname(fileURLToPath(context.parentURL))
      const matched = resolveTsCandidate(resolvePath(parentDir, specifier))
      if (matched) {
        return nextResolve(pathToFileURL(matched).href, context)
      }
    }

    return nextResolve(specifier, context)
  },

  load(url, context, nextLoad) {
    if (url.endsWith(".json") && !url.includes("/node_modules/")) {
      const source = readFileSync(fileURLToPath(url), "utf8")
      return {
        format: "module",
        source: `export default ${source}`,
        shortCircuit: true,
      }
    }
    if (
      (url.endsWith(".ts") || url.endsWith(".tsx")) &&
      !url.includes("/node_modules/") &&
      typeof stripTypeScriptTypes === "function"
    ) {
      let source = readFileSync(fileURLToPath(url), "utf8")
      const exportedTypeNames = []
      for (const m of source.matchAll(
        /^\s*export\s+(?:interface|type)\s+([A-Za-z0-9_]+)/gm
      )) {
        exportedTypeNames.push(m[1])
      }
      source = source.replace(
        /export\s+enum\s+([A-Za-z0-9_]+)\s*\{([^}]*)\}/g,
        (_m, name, body) => {
          const objBody = body.replace(/([A-Za-z0-9_]+)\s*=\s*/g, "$1: ")
          return `export const ${name} = {${objBody}} as const`
        }
      )
      let stripped = stripTypeScriptTypes(source, { mode: "strip" })
      if (exportedTypeNames.length > 0) {
        const stubs = [...new Set(exportedTypeNames)]
          .map((n) => `export const ${n} = undefined;`)
          .join("\n")
        stripped = `${stripped}\n${stubs}\n`
      }
      return {
        format: "module",
        source: stripped,
        shortCircuit: true,
      }
    }
    return nextLoad(url, context)
  },
})
