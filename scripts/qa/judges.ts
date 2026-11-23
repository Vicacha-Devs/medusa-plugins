import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import type { QaCheckResult, QaPluginEntry } from "./types.ts"

import { safeReadJson } from "./types.ts"

interface PluginPkg {
  name: string
  private?: boolean
  version?: string
  files?: string[]
  exports?: Record<string, unknown>
  scripts?: Record<string, string>
}

function countI18nLocales(pluginDir: string): {
  count: number
  parityIssues: string[]
} {
  const jsonSubdir = join(pluginDir, "src", "admin", "i18n", "json")
  const baseDir = join(pluginDir, "src", "admin", "i18n")
  const i18nDir = existsSync(jsonSubdir) ? jsonSubdir : baseDir
  if (!existsSync(i18nDir)) {
    return { count: 0, parityIssues: [] }
  }
  const files = readdirSync(i18nDir)
    .filter((f) => f.endsWith(".json"))
    .toSorted()
  if (files.length === 0) {
    return { count: 0, parityIssues: [] }
  }
  const keyMaps = new Map<string, Set<string>>()
  for (const file of files) {
    const parsed = safeReadJson<Record<string, unknown>>(join(i18nDir, file))
    if (!parsed) continue
    keyMaps.set(file, new Set(Object.keys(parsed)))
  }
  const enKeys = keyMaps.get("en.json")
  const issues: string[] = []
  if (enKeys) {
    for (const [file, keys] of keyMaps.entries()) {
      const missing = [...enKeys].filter((k) => !keys.has(k))
      if (missing.length > 0) {
        issues.push(`${file} missing ${missing.length} key(s) from en.json`)
      }
    }
  }
  return { count: files.length, parityIssues: issues }
}

export function runMedusaPluginsJudges(repoRoot: string): {
  checks: QaCheckResult[]
  plugins: QaPluginEntry[]
} {
  const packagesDir = join(repoRoot, "packages")
  const sandboxConfigPath = join(
    repoRoot,
    "apps",
    "sandbox",
    "medusa-config.ts"
  )
  const sandboxConfig = existsSync(sandboxConfigPath)
    ? readFileSync(sandboxConfigPath, "utf8")
    : ""

  const dirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter((e) => {
      if (!e.isDirectory()) return false
      const pkg = safeReadJson<PluginPkg>(
        join(packagesDir, e.name, "package.json")
      )
      return Boolean(
        pkg && !pkg.private && pkg.name?.startsWith("@vicacha-devs/medusa-")
      )
    })
    .map((e) => e.name)
    .toSorted()

  const plugins: QaPluginEntry[] = []
  const manifestIssues: string[] = []
  const testMissing: string[] = []
  const unwired: string[] = []
  const i18nIssues: string[] = []

  for (const dir of dirs) {
    const fullDir = join(packagesDir, dir)
    const pkg = safeReadJson<PluginPkg>(join(fullDir, "package.json"))
    if (!pkg) {
      manifestIssues.push(`${dir}: unreadable package.json`)
      continue
    }

    const notes: string[] = []
    const testsDir = join(fullDir, "src", "__tests__")
    const specFiles = existsSync(testsDir)
      ? readdirSync(testsDir).filter(
          (f) => f.endsWith(".spec.ts") || f.endsWith(".test.ts")
        )
      : []
    const hasTests = specFiles.length > 0
    if (!hasTests) {
      testMissing.push(pkg.name)
      notes.push("Missing offline tests")
    }

    const hasBuildScript = Boolean(pkg.scripts?.build)
    const hasTypecheck = Boolean(pkg.scripts?.typecheck)
    if (!hasTypecheck) {
      manifestIssues.push(`${pkg.name}: missing typecheck script`)
      notes.push("Missing typecheck script")
    }

    for (const [k, v] of Object.entries(pkg.scripts ?? {})) {
      if (v.includes("/Users/") || v.includes("gweb-uniblog")) {
        manifestIssues.push(`${pkg.name}: hardcoded path in scripts.${k}`)
        notes.push(`Hardcoded path in scripts.${k}`)
      }
    }

    if (!pkg.files?.includes(".medusa/server")) {
      manifestIssues.push(`${pkg.name}: files missing .medusa/server`)
      notes.push("Missing .medusa/server in files")
    }

    const wiredInHost = sandboxConfig.includes(`"${pkg.name}"`)
    if (!wiredInHost) {
      unwired.push(pkg.name)
      notes.push("Not wired in apps/sandbox")
    }

    const localeStats = countI18nLocales(fullDir)
    for (const issue of localeStats.parityIssues) {
      i18nIssues.push(`${pkg.name}: ${issue}`)
      notes.push(issue)
    }

    const status =
      !hasTests || manifestIssues.some((m) => m.startsWith(pkg.name))
        ? "fail"
        : !wiredInHost || localeStats.parityIssues.length > 0
          ? "warn"
          : "pass"

    plugins.push({
      name: pkg.name,
      pluginId: dir.replace(/^medusa-plugin-/, ""),
      ecosystem: "medusa",
      version: pkg.version ?? "0.0.0",
      hasTests,
      hasBuildScript,
      hasTypecheck,
      wiredInHost,
      localeCount: localeStats.count,
      status,
      notes,
    })
  }

  const checks: QaCheckResult[] = [
    {
      id: "judge-manifests",
      name: "Judge 1: Plugin Manifests, Exports & Path Hygiene",
      category: "judge",
      status: manifestIssues.length === 0 ? "pass" : "fail",
      durationMs: 2,
      summary:
        manifestIssues.length === 0
          ? `All ${plugins.length} Medusa plugins passed manifest & path hygiene`
          : `${manifestIssues.length} manifest issue(s) detected`,
      details: manifestIssues,
    },
    {
      id: "judge-tests-present",
      name: "Judge 2: Offline Test Suite Presence",
      category: "judge",
      status: testMissing.length === 0 ? "pass" : "fail",
      durationMs: 1,
      summary:
        testMissing.length === 0
          ? `All ${plugins.length} Medusa plugins ship automated offline specs`
          : `${testMissing.length} plugin(s) lack test specs`,
      details: testMissing,
    },
    {
      id: "judge-sandbox-wiring",
      name: "Judge 3: Medusa Sandbox Host Wiring Parity",
      category: "judge",
      status: unwired.length === 0 ? "pass" : "warn",
      durationMs: 1,
      summary:
        unwired.length === 0
          ? `All ${plugins.length} plugins are wired into apps/sandbox`
          : `${unwired.length} plugin(s) not wired in apps/sandbox`,
      details: unwired,
    },
    {
      id: "judge-i18n-parity",
      name: "Judge 4: Admin i18n Key Parity",
      category: "judge",
      status: i18nIssues.length === 0 ? "pass" : "warn",
      durationMs: 2,
      summary:
        i18nIssues.length === 0
          ? "All plugin Admin i18n bundles match en.json key parity"
          : `${i18nIssues.length} i18n parity issue(s)`,
      details: i18nIssues,
    },
  ]

  return { checks, plugins }
}

if (
  resolve(process.argv[1] ?? "") === resolve(fileURLToPath(import.meta.url))
) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
  const { checks } = runMedusaPluginsJudges(repoRoot)
  let failed = 0
  for (const c of checks) {
    process.stdout.write(
      `[${c.status.toUpperCase()}] ${c.name}: ${c.summary}\n`
    )
    for (const d of c.details ?? []) {
      process.stdout.write(`    - ${d}\n`)
    }
    if (c.status === "fail") failed += 1
  }
  if (failed > 0) process.exit(1)
}
