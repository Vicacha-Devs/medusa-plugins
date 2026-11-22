import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

describe("@vicacha-devs/medusa-plugin-b2b — Offline Contract Suite", () => {
  it("declares valid Medusa v2 plugin manifest & exports", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(pkgRoot, "package.json"), "utf8")
    ) as {
      name: string
      exports: Record<string, unknown>
      files: string[]
      scripts: Record<string, string>
    }
    assert.equal(pkg.name, "@vicacha-devs/medusa-plugin-b2b")
    assert.ok(pkg.exports["./admin"], "exports ./admin entry")
    assert.ok(pkg.exports["./workflows"], "exports ./workflows entry")
    assert.ok(pkg.files.includes(".medusa/server"), "ships .medusa/server")
    assert.ok(pkg.scripts.build, "has build script")
    assert.ok(pkg.scripts.typecheck, "has typecheck script")
  })

  it("contains required B2B modules, workflows, links, and API routes", () => {
    for (const rel of [
      "src/modules",
      "src/workflows",
      "src/links",
      "src/api",
      "src/admin",
    ]) {
      assert.ok(
        existsSync(resolve(pkgRoot, rel)),
        `Expected directory ${rel} to exist`
      )
    }
  })
})
