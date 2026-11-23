import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, relative, sep } from "node:path"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface MedusaRoute {
  method: HttpMethod
  path: string
  scope: "admin" | "store" | "webhooks" | "other"
  tag: string
  params: string[]
  requiresAuth: boolean
}

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"]

function extractExportedMethods(source: string): HttpMethod[] {
  const found: HttpMethod[] = []
  for (const method of HTTP_METHODS) {
    const pattern = new RegExp(
      `export\\s+(?:async\\s+function|const|let|function)\\s+${method}\\b`
    )
    if (pattern.test(source)) {
      found.push(method)
    }
  }
  return found
}

function toOpenApiPath(relDir: string): { path: string; params: string[] } {
  const params: string[] = []
  const segments = relDir
    .split(sep)
    .filter(Boolean)
    .map((seg) => {
      const match = /^\[(.+)\]$/.exec(seg)
      if (match) {
        const paramName = match[1].replace(/^\.\.\./, "")
        params.push(paramName)
        return `{${paramName}}`
      }
      return seg
    })
  return {
    path: `/${segments.join("/")}`,
    params,
  }
}

function inferScopeAndTag(apiPath: string): {
  scope: MedusaRoute["scope"]
  tag: string
} {
  if (apiPath.startsWith("/admin/")) {
    const seg = apiPath.split("/")[2] || "admin"
    return { scope: "admin", tag: `Admin: ${seg}` }
  }
  if (apiPath.startsWith("/store/")) {
    const seg = apiPath.split("/")[2] || "store"
    return { scope: "store", tag: `Storefront: ${seg}` }
  }
  if (apiPath.startsWith("/hooks/") || apiPath.startsWith("/webhooks/")) {
    return { scope: "webhooks", tag: "Webhooks & Hooks" }
  }
  return { scope: "other", tag: "Public & Utility" }
}

export function loadMedusaRoutes(pkgDir: string): MedusaRoute[] {
  const apiDir = join(pkgDir, "src/api")
  if (!existsSync(apiDir)) return []

  const routes: MedusaRoute[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.name === "route.ts" || entry.name === "route.js") {
        const source = readFileSync(full, "utf8")
        const methods = extractExportedMethods(source)
        const relDir = relative(apiDir, dir)
        const { path, params } = toOpenApiPath(relDir)
        const { scope, tag } = inferScopeAndTag(path)
        for (const method of methods) {
          routes.push({
            method,
            path,
            scope,
            tag,
            params,
            requiresAuth: scope === "admin",
          })
        }
      }
    }
  }

  walk(apiDir)
  return routes.toSorted((a, b) =>
    a.path === b.path
      ? a.method.localeCompare(b.method)
      : a.path.localeCompare(b.path)
  )
}
