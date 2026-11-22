import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { QaCheckResult, QaRepoReport } from "./types.ts";

import { writeQaDashboard } from "./dashboard.ts";
import { runMedusaPluginsDoctor } from "./doctor.ts";
import { runMedusaPluginsJudges } from "./judges.ts";
import {
  discoverSiblingReports,
  safeReadJson,
  summarizeChecks,
  writeQaReport,
} from "./types.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const strict = process.argv.includes("--strict");
const packagesDir = join(repoRoot, "packages");

function runCommandGate(
  id: string,
  name: string,
  bin: string,
  args: string[],
  cwd: string
): QaCheckResult {
  const start = Date.now();
  try {
    execFileSync(bin, args, { cwd, stdio: "pipe", encoding: "utf8" });
    return {
      id,
      name,
      category: "verify",
      status: "pass",
      durationMs: Date.now() - start,
      summary: `Passed in ${Date.now() - start}ms`,
    };
  } catch (err) {
    const out =
      (err as { stderr?: string; stdout?: string; message?: string }).stderr ||
      (err as { stdout?: string }).stdout ||
      (err as Error).message;
    return {
      id,
      name,
      category: "verify",
      status: "fail",
      durationMs: Date.now() - start,
      summary: `Failed (${Date.now() - start}ms)`,
      details: String(out).trim().split("\n").slice(-10),
    };
  }
}

const doctor = runMedusaPluginsDoctor(repoRoot);
const judges = runMedusaPluginsJudges(repoRoot);
const verifyChecks: QaCheckResult[] = [];

verifyChecks.push(
  runCommandGate(
    "publint-manifest",
    "Medusa Plugin Manifest & Publint Gate",
    process.execPath,
    [join(repoRoot, "scripts", "publint-all.ts")],
    repoRoot
  )
);

const sharedResolver = join(
  packagesDir,
  "plugin-testing",
  "register-ts-resolver.mjs"
);
const pluginDirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter((e) => {
    if (!e.isDirectory()) return false;
    const pkg = safeReadJson<{ name?: string; private?: boolean }>(
      join(packagesDir, e.name, "package.json")
    );
    return Boolean(
      pkg && !pkg.private && pkg.name?.startsWith("@vicacha-devs/medusa-")
    );
  })
  .map((e) => e.name)
  .sort();

for (const dir of pluginDirs) {
  const pkgDir = join(packagesDir, dir);
  const testsDir = join(pkgDir, "src", "__tests__");
  if (!existsSync(testsDir)) continue;
  const specs = readdirSync(testsDir)
    .filter((f) => f.endsWith(".spec.ts") || f.endsWith(".test.ts"))
    .sort()
    .map((f) => join("src", "__tests__", f));
  if (specs.length === 0) continue;

  const localResolver = join(testsDir, "register-ts-resolver.mjs");
  const resolver = existsSync(localResolver) ? localResolver : sharedResolver;

  verifyChecks.push(
    runCommandGate(
      `test-${dir}`,
      `Offline Unit/Contract Suite: ${dir}`,
      process.execPath,
      ["--import", resolver, "--test", ...specs],
      pkgDir
    )
  );
}

verifyChecks.push(
  runCommandGate(
    "sandbox-wiring",
    "Medusa Sandbox Wiring Contract Suite",
    process.execPath,
    ["--test", "tests/sandbox-wiring.spec.ts"],
    join(repoRoot, "apps", "sandbox")
  )
);

const allChecks = [...doctor.checks, ...judges.checks, ...verifyChecks];
const report: QaRepoReport = {
  schemaVersion: "qa-report/v1",
  repoId: "medusa-v2-extensions",
  repoName: "@vicacha-devs/medusa-v2-extensions",
  ecosystem: "medusa",
  repoPath: repoRoot,
  generatedAt: new Date().toISOString(),
  nodeVersion: process.versions.node,
  linkMode: "workspace",
  summary: summarizeChecks(allChecks, judges.plugins.length),
  checks: allChecks,
  plugins: judges.plugins,
  drifts: doctor.drifts,
};

const reportPath = writeQaReport(repoRoot, report);
const siblingReports = discoverSiblingReports(repoRoot);
const dashPath = writeQaDashboard(
  repoRoot,
  siblingReports.length > 1
    ? "Vicacha Ecosystem QA Control Center"
    : `${report.repoName} QA Report`,
  siblingReports.length > 0 ? siblingReports : [report]
);

for (const check of allChecks) {
  process.stdout.write(
    `[${check.status.toUpperCase()}] ${check.name} (${check.durationMs}ms) — ${check.summary}\n`
  );
}
process.stdout.write(`\nReport: ${reportPath}\nDashboard: ${dashPath}\n`);

if (report.summary.fail > 0 || (strict && report.summary.warn > 0)) {
  process.exit(1);
}
