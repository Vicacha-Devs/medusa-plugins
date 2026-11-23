const baseUrl = process.env.MEDUSA_SANDBOX_URL || "http://127.0.0.1:9001"

interface SmokeTarget {
  name: string
  path: string
  expectedStatuses: number[]
}

const targets: SmokeTarget[] = [
  { name: "Medusa Sandbox /health", path: "/health", expectedStatuses: [200] },
  {
    name: "Admin Auth Guard (/admin/products)",
    path: "/admin/products",
    expectedStatuses: [401, 403],
  },
]

let failed = 0
for (const target of targets) {
  const url = new URL(target.path, baseUrl).toString()
  try {
    const res = await fetch(url, { redirect: "manual" })
    const ok = target.expectedStatuses.includes(res.status)
    process.stdout.write(
      `[${ok ? "PASS" : "FAIL"}] ${target.name} -> HTTP ${res.status}\n`
    )
    if (!ok) failed += 1
  } catch (err) {
    console.error(`[FAIL] ${target.name} -> ${(err as Error).message}`)
    failed += 1
  }
}

if (failed > 0) {
  console.error(
    `[qa:smoke] ${failed} check(s) failed against ${baseUrl}. Ensure sandbox is running.`
  )
  process.exit(1)
}
process.stdout.write(`[qa:smoke] All Medusa sandbox smoke checks passed.\n`)
