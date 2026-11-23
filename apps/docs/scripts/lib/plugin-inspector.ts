import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { basename, dirname, join, resolve } from "node:path"

export function assertWithinBoundary(
  targetPath: string,
  boundaryDir: string
): string {
  const resolvedTarget = resolve(targetPath)
  const resolvedBoundary = resolve(boundaryDir)
  if (
    resolvedTarget !== resolvedBoundary &&
    !resolvedTarget.startsWith(`${resolvedBoundary}/`)
  ) {
    throw new Error(
      `Path escapes boundary ${resolvedBoundary}: ${resolvedTarget}`
    )
  }
  return resolvedTarget
}

export function writeMarkdownFile(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, content, "utf8")
}

export function yamlQuote(value: string): string {
  return JSON.stringify(value)
}

export interface InspectedPlugin {
  pkgJson: {
    name?: string
    version?: string
    description?: string
    peerDependencies?: Record<string, string>
    dependencies?: Record<string, string>
  }
  modules: Array<{ name: string; models: string[] }>
  workflows: string[]
  subscribers: string[]
  jobs: string[]
  providers: string[]
  adminRoutes: string[]
  adminWidgets: string[]
  adminLocales: string[]
}

function collectFiles(
  dir: string,
  predicate: (name: string) => boolean
): string[] {
  if (!existsSync(dir)) return []
  const results: string[] = []
  const walk = (current: string, prefix: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        walk(join(current, entry.name), rel)
      } else if (predicate(entry.name)) {
        results.push(rel)
      }
    }
  }
  walk(dir, "")
  return results.toSorted()
}

export function inspectPlugin(pkgDir: string): InspectedPlugin {
  const pkgJsonPath = join(pkgDir, "package.json")
  const pkgJson = existsSync(pkgJsonPath)
    ? (JSON.parse(
        readFileSync(pkgJsonPath, "utf8")
      ) as InspectedPlugin["pkgJson"])
    : {}

  // Modules & models
  const modulesDir = join(pkgDir, "src/modules")
  const modules: InspectedPlugin["modules"] = []
  if (existsSync(modulesDir)) {
    for (const entry of readdirSync(modulesDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const modelsDir = join(modulesDir, entry.name, "models")
      const models = existsSync(modelsDir)
        ? readdirSync(modelsDir)
            .filter((f) => f.endsWith(".ts") && f !== "index.ts")
            .map((f) => basename(f, ".ts"))
            .toSorted()
        : []
      modules.push({ name: entry.name, models })
    }
  }

  // Workflows
  const workflows = collectFiles(
    join(pkgDir, "src/workflows"),
    (n) => n.endsWith(".ts") && n !== "index.ts" && !n.endsWith(".d.ts")
  )
    .filter((f) => !f.includes("/steps/"))
    .map((f) => basename(f, ".ts"))

  // Subscribers
  const subscribers = collectFiles(
    join(pkgDir, "src/subscribers"),
    (n) => n.endsWith(".ts") && n !== "index.ts"
  ).map((f) => basename(f, ".ts"))

  // Scheduled jobs
  const jobs = collectFiles(
    join(pkgDir, "src/jobs"),
    (n) => n.endsWith(".ts") && n !== "index.ts"
  ).map((f) => basename(f, ".ts"))

  // Providers
  const providersDir = join(pkgDir, "src/providers")
  const providers = existsSync(providersDir)
    ? readdirSync(providersDir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .toSorted()
    : []

  // Admin routes & widgets
  const adminRoutes = collectFiles(
    join(pkgDir, "src/admin/routes"),
    (n) => n === "page.tsx" || n === "page.ts"
  ).map((f) => `/${dirname(f) === "." ? "" : dirname(f)}`)

  const adminWidgets = collectFiles(
    join(pkgDir, "src/admin/widgets"),
    (n) => n.endsWith(".tsx") || n.endsWith(".ts")
  ).map((f) => basename(f, ".tsx"))

  // Admin i18n locales
  const i18nDir = join(pkgDir, "src/admin/i18n/json")
  const adminLocales = existsSync(i18nDir)
    ? readdirSync(i18nDir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => basename(f, ".json"))
        .toSorted()
    : []

  return {
    pkgJson,
    modules,
    workflows: [...new Set(workflows)].slice(0, 24),
    subscribers,
    jobs,
    providers,
    adminRoutes,
    adminWidgets,
    adminLocales,
  }
}
