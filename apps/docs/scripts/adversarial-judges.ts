#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, extname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { guides, plugins } from "../docs-packages.ts"

interface JudgeResult {
  name: string
  checked: string
  failures: string[]
}

const HERE = dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = resolve(HERE, "..")
const CONTENT_ROOT = join(DOCS_ROOT, "src/content/docs")
const DIST_ROOT = join(DOCS_ROOT, "dist")
const SCHEMAS_ROOT = join(DOCS_ROOT, "schemas")

const IGNORE_DIRS = new Set([
  "node_modules",
  "dist",
  ".astro",
  "vendor",
  "schemas",
])

function walkFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      walkFiles(full, out)
    } else if (entry.isFile()) {
      out.push(full)
    }
  }
  return out
}

function judgeModularity(): JudgeResult {
  const failures: string[] = []
  const exts = new Set([".ts", ".tsx", ".js", ".mjs", ".md", ".mdx", ".css"])
  const files = walkFiles(DOCS_ROOT)
    .filter((f) => exts.has(extname(f)))
    .filter((f) => !relative(DOCS_ROOT, f).includes("src/content/docs/medusa-"))
  for (const file of files) {
    const lines = readFileSync(file, "utf8").split("\n").length
    if (lines > 500) {
      failures.push(
        `${relative(DOCS_ROOT, file)} has ${lines} lines (limit: 500)`
      )
    }
  }
  return {
    name: "Judge 1 — Docs Modularity (<= 500 lines)",
    checked: `${files.length} docs source/content files`,
    failures,
  }
}

function judgeCompleteness(): JudgeResult {
  const failures: string[] = []
  for (const p of plugins) {
    if (p.schemaFile) {
      const schemaPath = join(SCHEMAS_ROOT, `${p.schemaFile}.yaml`)
      if (!existsSync(schemaPath)) {
        failures.push(`Missing OpenAPI schema: schemas/${p.schemaFile}.yaml`)
      } else {
        const yamlText = readFileSync(schemaPath, "utf8")
        if (
          !yamlText.includes("openapi: 3.1.0") ||
          !yamlText.includes("paths:")
        ) {
          failures.push(`Invalid OpenAPI spec in schemas/${p.schemaFile}.yaml`)
        }
      }
    }

    for (const page of ["index.md", "use-cases.md", "guide.md"]) {
      const pPath = join(CONTENT_ROOT, p.slug, page)
      if (!existsSync(pPath)) {
        failures.push(`Missing plugin doc page: ${p.slug}/${page}`)
      }
    }

    for (const locale of ["es", "ar", "tr"]) {
      const locPath = join(CONTENT_ROOT, locale, p.slug, "index.md")
      if (!existsSync(locPath)) {
        failures.push(
          `Missing localized overview: ${locale}/${p.slug}/index.md`
        )
      }
    }
  }

  for (const g of guides) {
    const gPath = join(CONTENT_ROOT, `${g.slug}.md`)
    if (!existsSync(gPath)) {
      failures.push(`Missing guide: ${g.slug}.md`)
    }
  }

  for (const locale of ["es", "ar", "tr"]) {
    if (!existsSync(join(CONTENT_ROOT, locale, "index.mdx"))) {
      failures.push(`Missing localized landing page: ${locale}/index.mdx`)
    }
  }

  return {
    name: "Judge 2 — Plugin Docs, OpenAPI & i18n Completeness",
    checked: `${plugins.length} plugins, ${guides.length} guides, 4 locales`,
    failures,
  }
}

function judgeBuiltDist(): JudgeResult {
  const failures: string[] = []
  if (!existsSync(DIST_ROOT)) {
    failures.push("apps/docs/dist does not exist — run `pnpm docs:build` first")
    return {
      name: "Judge 3 — Built Static Output",
      checked: "0 HTML files",
      failures,
    }
  }

  const requiredHtml = [
    "index.html",
    "es/index.html",
    "ar/index.html",
    "tr/index.html",
    ...guides.map((g) => `${g.slug}/index.html`),
    ...plugins.flatMap((p) => [
      `${p.slug}/index.html`,
      `${p.slug}/use-cases/index.html`,
      `${p.slug}/guide/index.html`,
    ]),
  ]

  for (const rel of requiredHtml) {
    if (!existsSync(join(DIST_ROOT, rel))) {
      failures.push(`Missing built page: dist/${rel}`)
    }
  }

  return {
    name: "Judge 3 — Built Static Output",
    checked: `${requiredHtml.length} required HTML pages`,
    failures,
  }
}

function main(): void {
  const results = [judgeModularity(), judgeCompleteness(), judgeBuiltDist()]
  let totalFailures = 0

  for (const r of results) {
    const status = r.failures.length === 0 ? "PASS" : "FAIL"
    console.log(`[${status}] ${r.name} (${r.checked})`)
    for (const f of r.failures) {
      console.error(`  - ${f}`)
      totalFailures++
    }
  }

  if (totalFailures > 0) {
    console.error(`\n[docs:judges] Failed with ${totalFailures} issue(s).`)
    process.exit(1)
  }
  console.log("\n[docs:judges] All documentation quality judges passed.")
}

main()
