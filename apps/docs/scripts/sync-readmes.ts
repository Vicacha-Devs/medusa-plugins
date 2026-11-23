#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs"
import { basename, dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import {
  type NonDefaultLocale,
  type PluginPackageMeta,
  plugins,
} from "../docs-packages.ts"
import {
  buildLocalizedOverview,
  generateLocalizedLandings,
} from "./lib/i18n-content.ts"
import {
  assertWithinBoundary,
  type InspectedPlugin,
  inspectPlugin,
  writeMarkdownFile,
  yamlQuote,
} from "./lib/plugin-inspector.ts"
import { loadMedusaRoutes, type MedusaRoute } from "./lib/route-loader.ts"

const HERE = dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = resolve(HERE, "..")
const REPO_ROOT = resolve(DOCS_ROOT, "../..")
const PACKAGES_ROOT = resolve(REPO_ROOT, "packages")
const CONTENT_DOCS_ROOT = resolve(DOCS_ROOT, "src/content/docs")

function cleanReadmeBody(md: string): string {
  return md
    .split("\n")
    .filter((line) => !/^#\s+/.test(line))
    .join("\n")
    .replace(/^\n+/, "")
    .replace(/\n{3,}/g, "\n\n")
}

function buildOverviewPage(
  plugin: PluginPackageMeta,
  info: InspectedPlugin,
  routes: MedusaRoute[],
  readmeBody: string
): string {
  const description = info.pkgJson.description || plugin.summary.en
  const body =
    readmeBody.trim() ||
    `${description}

## Installation

\`\`\`bash
pnpm add ${plugin.npmName}
\`\`\`

Register the plugin in \`medusa-config.ts\`:

\`\`\`ts
export default defineConfig({
  plugins: [
    {
      resolve: "${plugin.npmName}",
      options: {},
    },
  ],
});
\`\`\`
`

  const moduleCount = info.modules.length
  const modelCount = info.modules.reduce((acc, m) => acc + m.models.length, 0)
  const apiBadge = plugin.schemaFile
    ? `| HTTP Endpoints | ${routes.length} ([OpenAPI Reference](/${plugin.slug}/api/)) |`
    : `| HTTP Endpoints | Provider / Middleware-only (no custom HTTP routes) |`

  return `---
title: ${yamlQuote(plugin.label)}
description: ${yamlQuote(description)}
---

> **Package:** \`${plugin.npmName}\` · **Version:** \`${info.pkgJson.version || "0.0.1"}\` · **Category:** ${plugin.category}

## Package Snapshot

| Capability | Details |
| :--- | :--- |
| Medusa Modules / Models | ${moduleCount} modules / ${modelCount} data models |
| Workflows | ${info.workflows.length} |
| Subscribers / Jobs | ${info.subscribers.length} subscribers / ${info.jobs.length} scheduled jobs |
| Providers | ${info.providers.length > 0 ? info.providers.join(", ") : "—"} |
| Admin UI Routes / Widgets | ${info.adminRoutes.length} routes / ${info.adminWidgets.length} widgets |
| Admin i18n Locales | ${info.adminLocales.length > 0 ? info.adminLocales.join(", ") : "en"} |
${apiBadge}

${body.trim()}
`
}

function buildUseCasesPage(
  plugin: PluginPackageMeta,
  info: InspectedPlugin,
  routes: MedusaRoute[]
): string {
  const modelsRows =
    info.modules.length > 0
      ? info.modules
          .flatMap((m) =>
            m.models.length > 0
              ? m.models.map((model) => `| \`${m.name}\` | \`${model}\` |`)
              : [`| \`${m.name}\` | _(service-only module)_ |`]
          )
          .join("\n")
      : "| _None_ | _Provider / Route-only plugin_ |"

  const adminRoutesCount = routes.filter((r) => r.scope === "admin").length
  const storeRoutesCount = routes.filter((r) => r.scope === "store").length
  const webhookCount = routes.filter((r) => r.scope === "webhooks").length

  const mermaidLines = [
    "flowchart LR",
    `  Storefront["Storefront / Client"] -->|"${storeRoutesCount} Store API routes"| Plugin["${plugin.npmName}"]`,
    `  Admin["Medusa Admin UI (${info.adminRoutes.length} pages)"] -->|"${adminRoutesCount} Admin API routes"| Plugin`,
  ]
  if (info.modules.length > 0) {
    mermaidLines.push(
      `  Plugin --> Modules["Medusa Modules (${info.modules.map((m) => m.name).join(", ")})"]`
    )
  }
  if (info.workflows.length > 0) {
    mermaidLines.push(
      `  Plugin --> Workflows["Workflows (${info.workflows.length})"]`
    )
  }
  if (info.providers.length > 0) {
    mermaidLines.push(
      `  Plugin --> Providers["Providers (${info.providers.join(", ")})"]`
    )
  }
  if (webhookCount > 0) {
    mermaidLines.push(
      `  External["External Gateway"] -->|"${webhookCount} Webhooks"| Plugin`
    )
  }

  return `---
title: ${yamlQuote(`${plugin.label} — Data Models & Use Cases`)}
description: ${yamlQuote(`Medusa v2 modules, data models, architecture diagram, and use cases for ${plugin.npmName}.`)}
---

${plugin.summary.en}

## Architecture Overview

\`\`\`mermaid
${mermaidLines.join("\n")}
\`\`\`

## Medusa Modules & Data Models

| Module | Data Model |
| :--- | :--- |
${modelsRows}

## Key Capabilities & Integration Points

- **Package:** \`${plugin.npmName}\`
- **Workflows:** ${info.workflows.length > 0 ? info.workflows.map((w) => `\`${w}\``).join(", ") : "None"}
- **Event Subscribers:** ${info.subscribers.length > 0 ? info.subscribers.map((s) => `\`${s}\``).join(", ") : "None"}
- **Scheduled Jobs:** ${info.jobs.length > 0 ? info.jobs.map((j) => `\`${j}\``).join(", ") : "None"}
`
}

function buildGuidePage(
  plugin: PluginPackageMeta,
  info: InspectedPlugin,
  routes: MedusaRoute[]
): string {
  const adminList =
    info.adminRoutes.length > 0
      ? info.adminRoutes.map((r) => `- \`/app${r}\``).join("\n")
      : "- No custom Admin UI pages registered."

  const widgetList =
    info.adminWidgets.length > 0
      ? info.adminWidgets.map((w) => `- \`${w}\``).join("\n")
      : "- No Admin UI widgets registered."

  const apiNote = plugin.schemaFile
    ? `This plugin exposes **${routes.length} HTTP endpoints**. Browse request/response details in the [Interactive OpenAPI Reference](/${plugin.slug}/api/).`
    : "This plugin registers Medusa v2 providers/middlewares without custom HTTP route files."

  return `---
title: ${yamlQuote(`${plugin.label} — Developer Guide`)}
description: ${yamlQuote(`Installation, medusa-config.ts setup, Admin UI routes, and developer guide for ${plugin.npmName}.`)}
---

## Installation

\`\`\`bash
pnpm add ${plugin.npmName}
\`\`\`

## \`medusa-config.ts\` Registration

\`\`\`ts
import { defineConfig } from "@medusajs/framework/utils";

export default defineConfig({
  plugins: [
    {
      resolve: "${plugin.npmName}",
      options: {},
    },
  ],
});
\`\`\`

## Admin UI Extensions

### Admin Routes
${adminList}

### Admin Widgets
${widgetList}

### Supported Admin Locales
${info.adminLocales.length > 0 ? info.adminLocales.map((l) => `\`${l}\``).join(", ") : "`en`"}

## API Reference

${apiNote}
`
}

function main(): void {
  generateLocalizedLandings(CONTENT_DOCS_ROOT)

  for (const plugin of plugins) {
    const safeDir = basename(plugin.dir)
    const safeSlug = basename(plugin.slug)
    const pkgDir = assertWithinBoundary(
      resolve(PACKAGES_ROOT, safeDir),
      PACKAGES_ROOT
    )
    const readmePath = assertWithinBoundary(
      resolve(pkgDir, "README.md"),
      pkgDir
    )

    const readmeBody = existsSync(readmePath)
      ? cleanReadmeBody(readFileSync(readmePath, "utf8"))
      : ""
    const info = inspectPlugin(pkgDir)
    const routes = loadMedusaRoutes(pkgDir)

    writeMarkdownFile(
      resolve(CONTENT_DOCS_ROOT, safeSlug, "index.md"),
      buildOverviewPage(plugin, info, routes, readmeBody)
    )
    writeMarkdownFile(
      resolve(CONTENT_DOCS_ROOT, safeSlug, "use-cases.md"),
      buildUseCasesPage(plugin, info, routes)
    )
    writeMarkdownFile(
      resolve(CONTENT_DOCS_ROOT, safeSlug, "guide.md"),
      buildGuidePage(plugin, info, routes)
    )

    for (const locale of ["es", "ar", "tr"] as NonDefaultLocale[]) {
      writeMarkdownFile(
        resolve(CONTENT_DOCS_ROOT, locale, safeSlug, "index.md"),
        buildLocalizedOverview(plugin, locale, routes.length)
      )
    }
  }

  console.log(
    `[sync-readmes] Synced documentation for ${plugins.length} plugins.`
  )
}

main()
