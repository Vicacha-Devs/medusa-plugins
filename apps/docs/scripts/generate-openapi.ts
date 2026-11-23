#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { stringify } from "yaml"

import { type PluginPackageMeta, plugins } from "../docs-packages.ts"
import { assertWithinBoundary } from "./lib/plugin-inspector.ts"
import { loadMedusaRoutes, type MedusaRoute } from "./lib/route-loader.ts"

const HERE = dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = resolve(HERE, "..")
const REPO_ROOT = resolve(DOCS_ROOT, "../..")
const PACKAGES_DIR = resolve(REPO_ROOT, "packages")
const OUTPUT_DIR = resolve(DOCS_ROOT, "schemas")

interface SidebarEntry {
  label: string
  link: string
}

interface SidebarGroup {
  label: string
  collapsed: boolean
  items: SidebarEntry[]
}

function toOperationId(method: string, path: string): string {
  const parts = path
    .split("/")
    .filter(Boolean)
    .map((seg) => {
      const m = /^\{(.+)\}$/.exec(seg)
      if (m) return `By${m[1][0].toUpperCase()}${m[1].slice(1)}`
      return seg
        .split("-")
        .map((w) => (w ? `${w[0].toUpperCase()}${w.slice(1)}` : ""))
        .join("")
    })
  return `${method.toLowerCase()}${parts.join("")}`
}

function toSummary(method: string, path: string): string {
  const clean = path
    .replace(/^\/(admin|store)\//, "")
    .split("/")
    .map((seg) => (/^\{(.+)\}$/.test(seg) ? "by ID" : seg.replace(/-/g, " ")))
    .join(" ")
  const verb =
    method === "GET"
      ? path.includes("{")
        ? "Get"
        : "List"
      : method === "POST"
        ? "Create / Trigger"
        : method === "PUT" || method === "PATCH"
          ? "Update"
          : "Delete"
  return `${verb} ${clean}`.trim()
}

function buildSpec(
  plugin: PluginPackageMeta,
  pkgDir: string,
  routes: MedusaRoute[]
) {
  const pkgJsonPath = join(pkgDir, "package.json")
  const pkgJson = existsSync(pkgJsonPath)
    ? (JSON.parse(readFileSync(pkgJsonPath, "utf8")) as {
        version?: string
        description?: string
      })
    : {}

  const paths: Record<string, Record<string, unknown>> = {}
  const sidebarGroups = new Map<string, SidebarEntry[]>()
  const usedOpIds = new Set<string>()

  for (const route of routes) {
    let opId = toOperationId(route.method, route.path)
    if (usedOpIds.has(opId)) {
      let idx = 2
      while (usedOpIds.has(`${opId}${idx}`)) idx++
      opId = `${opId}${idx}`
    }
    usedOpIds.add(opId)

    const summary = toSummary(route.method, route.path)
    const parameters = route.params.map((name) => ({
      name,
      in: "path",
      required: true,
      description: `Resource identifier (${name})`,
      schema: { type: "string" },
    }))

    const operation: Record<string, unknown> = {
      operationId: opId,
      summary,
      description: `${route.method} ${route.path} endpoint exposed by ${plugin.npmName}.`,
      tags: [route.tag],
      ...(parameters.length > 0 ? { parameters } : {}),
      ...(route.scope === "admin"
        ? { security: [{ adminBearer: [] }] }
        : route.scope === "store"
          ? { security: [{ publishableKey: [] }] }
          : {}),
      ...(route.method === "POST" ||
      route.method === "PUT" ||
      route.method === "PATCH"
        ? {
            requestBody: {
              required: false,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    additionalProperties: true,
                  },
                },
              },
            },
          }
        : {}),
      responses: {
        "200": {
          description: "Successful response",
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
        },
        ...(route.scope === "admin"
          ? {
              "401": {
                description: "Unauthorized — Admin authentication required",
              },
            }
          : {}),
      },
    }

    if (!paths[route.path]) paths[route.path] = {}
    paths[route.path][route.method.toLowerCase()] = operation

    const groupItems = sidebarGroups.get(route.tag) ?? []
    groupItems.push({
      label: summary,
      link: `/${plugin.slug}/api/operations/${opId.toLowerCase()}/`,
    })
    sidebarGroups.set(route.tag, groupItems)
  }

  const spec = {
    openapi: "3.1.0",
    info: {
      title: `${plugin.npmName} API`,
      version: pkgJson.version || "0.0.1",
      description: pkgJson.description || plugin.summary.en,
    },
    servers: [
      {
        url: "http://127.0.0.1:9000",
        description: "Local Medusa v2 Server",
      },
    ],
    components: {
      securitySchemes: {
        adminBearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Medusa Admin JWT or API token",
        },
        publishableKey: {
          type: "apiKey",
          in: "header",
          name: "x-publishable-api-key",
          description: "Medusa Storefront Publishable API Key",
        },
      },
    },
    paths,
  }

  const sidebar: SidebarGroup[] = [...sidebarGroups.entries()].map(
    ([label, items]) => ({
      label,
      collapsed: true,
      items,
    })
  )

  return { spec, sidebar }
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  const sidebarMap: Record<string, SidebarGroup[]> = {}
  let generatedCount = 0

  for (const plugin of plugins) {
    if (!plugin.schemaFile) continue
    const safeDir = basename(plugin.dir)
    const pkgDir = assertWithinBoundary(
      resolve(PACKAGES_DIR, safeDir),
      PACKAGES_DIR
    )
    const routes = loadMedusaRoutes(pkgDir)
    if (routes.length === 0) continue

    const { spec, sidebar } = buildSpec(plugin, pkgDir, routes)
    const outPath = assertWithinBoundary(
      resolve(OUTPUT_DIR, `${basename(plugin.schemaFile)}.yaml`),
      OUTPUT_DIR
    )
    writeFileSync(outPath, stringify(spec), "utf8")
    sidebarMap[plugin.slug] = sidebar
    generatedCount++
  }

  writeFileSync(
    resolve(OUTPUT_DIR, "_sidebar.json"),
    `${JSON.stringify(sidebarMap, null, 2)}\n`,
    "utf8"
  )
  console.log(
    `[generate-openapi] Generated ${generatedCount} OpenAPI schemas in ${OUTPUT_DIR}`
  )
}

main()
