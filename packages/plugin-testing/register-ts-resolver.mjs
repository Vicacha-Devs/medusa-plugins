import { existsSync, readFileSync } from "node:fs"
import * as nodeModule from "node:module"
import { dirname, resolve as resolvePath } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const { registerHooks, stripTypeScriptTypes } = nodeModule
const currentDir = dirname(fileURLToPath(import.meta.url))
const shimUrl = pathToFileURL(resolvePath(currentDir, "medusa-shim.mjs")).href

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith("@medusajs/") ||
      specifier === "react" ||
      specifier.startsWith("react/") ||
      specifier === "react-i18next" ||
      specifier === "react-router-dom" ||
      specifier === "react-hook-form" ||
      specifier.startsWith("@hookform/") ||
      specifier === "zod"
    ) {
      return { url: shimUrl, shortCircuit: true }
    }

    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      context.parentURL
    ) {
      const parentDir = dirname(fileURLToPath(context.parentURL))
      const baseCandidate = resolvePath(parentDir, specifier)
      const candidates = [
        `${baseCandidate}.ts`,
        `${baseCandidate}.tsx`,
        `${baseCandidate}.json`,
        resolvePath(baseCandidate, "index.ts"),
        resolvePath(baseCandidate, "index.tsx"),
      ]
      for (const candidate of candidates) {
        if (existsSync(candidate)) {
          return nextResolve(pathToFileURL(candidate).href, context)
        }
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
    if (url.endsWith(".ts") && !url.includes("/node_modules/")) {
      const source = readFileSync(fileURLToPath(url), "utf8")
      if (typeof stripTypeScriptTypes === "function") {
        return {
          format: "module",
          source: stripTypeScriptTypes(source, { mode: "strip" }),
          shortCircuit: true,
        }
      }
    }
    return nextLoad(url, context)
  },
})
