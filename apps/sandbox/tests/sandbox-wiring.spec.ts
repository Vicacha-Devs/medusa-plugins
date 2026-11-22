import assert from "node:assert/strict"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"

const sandboxDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const repoRoot = resolve(sandboxDir, "../..")
const packagesDir = join(repoRoot, "packages")

function listPluginPackages(): Array<{ dir: string; name: string }> {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const pkgPath = join(packagesDir, entry.name, "package.json")
      if (!existsSync(pkgPath)) return []
      const manifest = JSON.parse(readFileSync(pkgPath, "utf8")) as {
        name?: string
        private?: boolean
      }
      if (manifest.private || !manifest.name?.startsWith("@vicacha-devs/medusa-")) {
        return []
      }
      return [{ dir: entry.name, name: manifest.name }]
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

describe("@vicacha-devs/medusa-sandbox — Plugin Wiring Contract", () => {
  it("registers every publishable workspace Medusa plugin in sandbox package.json and medusa-config.ts", () => {
    const plugins = listPluginPackages()
    assert.ok(plugins.length >= 11, `Expected >= 11 plugins, found ${plugins.length}`)

    const sandboxPkg = JSON.parse(
      readFileSync(join(sandboxDir, "package.json"), "utf8")
    ) as { dependencies: Record<string, string> }
    const configSource = readFileSync(join(sandboxDir, "medusa-config.ts"), "utf8")

    for (const plugin of plugins) {
      assert.equal(
        sandboxPkg.dependencies[plugin.name],
        "workspace:*",
        `Sandbox package.json missing workspace dependency for ${plugin.name}`
      )
      assert.ok(
        configSource.includes(`"${plugin.name}"`),
        `Sandbox medusa-config.ts missing plugin entry for ${plugin.name}`
      )
      assert.ok(
        existsSync(join(packagesDir, plugin.dir, "src")),
        `${plugin.dir} missing src/ directory`
      )
    }
  })

  it("binds sandbox dev server strictly to loopback 127.0.0.1", () => {
    const configSource = readFileSync(join(sandboxDir, "medusa-config.ts"), "utf8")
    assert.ok(configSource.includes('host: "127.0.0.1"'))
    assert.ok(!configSource.includes("0.0.0.0"))
  })
})
