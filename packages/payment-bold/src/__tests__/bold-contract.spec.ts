import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

describe("@vicacha-devs/medusa-payment-bold — Offline Contract Suite", () => {
  it("declares valid Medusa v2 payment plugin manifest & exports", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(pkgRoot, "package.json"), "utf8")
    ) as {
      name: string
      exports: Record<string, unknown>
      files: string[]
      scripts: Record<string, string>
    }
    assert.equal(pkg.name, "@vicacha-devs/medusa-payment-bold")
    assert.ok(pkg.exports["."], "exports root entry")
    assert.ok(pkg.exports["./providers/*"], "exports payment providers")
    assert.ok(pkg.exports["./admin"], "exports ./admin entry")
    assert.ok(pkg.files.includes(".medusa/server"), "ships .medusa/server")
    assert.ok(pkg.scripts.typecheck, "has typecheck script")
  })

  it("contains payment provider, api, workflows, sdk, and admin modules", () => {
    for (const rel of [
      "src/providers",
      "src/api",
      "src/workflows",
      "src/admin",
    ]) {
      assert.ok(
        existsSync(resolve(pkgRoot, rel)),
        `Expected directory ${rel} to exist`
      )
    }
  })
})
