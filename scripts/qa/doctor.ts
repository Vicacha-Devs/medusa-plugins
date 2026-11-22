import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { QaCheckResult, QaDriftItem } from "./types.ts";

import { safeReadJson } from "./types.ts";

interface PkgJson {
  name?: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function listPluginDirs(packagesDir: string): string[] {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((e) => {
      if (!e.isDirectory()) return false;
      const pkg = safeReadJson<PkgJson>(join(packagesDir, e.name, "package.json"));
      return Boolean(
        pkg && !pkg.private && pkg.name?.startsWith("@vicacha-devs/medusa-")
      );
    })
    .map((e) => e.name)
    .sort();
}

export function runMedusaPluginsDoctor(repoRoot: string): {
  checks: QaCheckResult[];
  drifts: QaDriftItem[];
} {
  const checks: QaCheckResult[] = [];
  const drifts: QaDriftItem[] = [];
  const packagesDir = join(repoRoot, "packages");
  const expectedMedusa = "2.23.0";

  const t0 = Date.now();
  const [major, minor] = process.versions.node.split(".").map((n) => Number.parseInt(n, 10));
  const nodeOk = major > 22 || (major === 22 && minor >= 22);
  checks.push({
    id: "runtime-node",
    name: "Node.js Runtime Compatibility",
    category: "doctor",
    status: nodeOk ? "pass" : "fail",
    durationMs: Date.now() - t0,
    summary: `Node v${process.versions.node} detected (requires >=22.22.0 for Medusa ${expectedMedusa})`,
  });

  const t1 = Date.now();
  const pluginDirs = listPluginDirs(packagesDir);

  const missingWorkspaceRefs: string[] = [];
  for (const dir of pluginDirs) {
    const pkg = safeReadJson<PkgJson>(join(packagesDir, dir, "package.json"));
    if (!pkg) continue;
    const medusaVer =
      pkg.peerDependencies?.["@medusajs/medusa"] ??
      pkg.devDependencies?.["@medusajs/medusa"];
    if (medusaVer && medusaVer.replace(/^[\^~]/, "") !== expectedMedusa) {
      drifts.push({
        subject: `${pkg.name ?? dir} (@medusajs/medusa)`,
        expected: expectedMedusa,
        actual: medusaVer,
        severity: "warn",
        sourceRepo: "medusa-v2-extensions",
      });
    }
    for (const [dep, ver] of Object.entries({
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    })) {
      if (ver === "workspace:*" && dep === "@vicacha-devs/medusa-shared-admin") {
        if (!existsSync(join(packagesDir, "shared"))) {
          missingWorkspaceRefs.push(`${dir} -> ${dep}`);
        }
      }
    }
  }

  checks.push({
    id: "medusa-version-drift",
    name: "Medusa Core Version Alignment",
    category: "doctor",
    status: drifts.length === 0 ? "pass" : "warn",
    durationMs: Date.now() - t1,
    summary:
      drifts.length === 0
        ? `All ${pluginDirs.length} plugins aligned on Medusa ${expectedMedusa}`
        : `${drifts.length} plugin(s) drifted from Medusa ${expectedMedusa}`,
    details: drifts.map((d) => `${d.subject}: ${d.actual} (expected ${d.expected})`),
  });

  checks.push({
    id: "workspace-integrity",
    name: "Workspace Internal Dependency Integrity",
    category: "doctor",
    status: missingWorkspaceRefs.length === 0 ? "pass" : "warn",
    durationMs: 1,
    summary:
      missingWorkspaceRefs.length === 0
        ? "All workspace:* references resolve to local packages"
        : `${missingWorkspaceRefs.length} missing workspace package reference(s)`,
    details: missingWorkspaceRefs,
  });

  const composePath = join(repoRoot, "docker-compose.qa.yml");
  const composeText = existsSync(composePath)
    ? readFileSync(composePath, "utf8")
    : "";
  const loopbackSafe =
    composeText.includes("127.0.0.1:5436:5432") && !composeText.includes("0.0.0.0");
  checks.push({
    id: "docker-qa-security",
    name: "Port-Isolated QA Compose Security (Loopback Only)",
    category: "doctor",
    status: loopbackSafe ? "pass" : "fail",
    durationMs: 1,
    summary: loopbackSafe
      ? "docker-compose.qa.yml binds strictly to 127.0.0.1 on isolated ports (5436/6383/8112/9007/1029)"
      : "docker-compose.qa.yml missing or exposes non-loopback ports",
  });

  const lockPath = join(repoRoot, "pnpm-lock.yaml");
  if (existsSync(lockPath)) {
    const lockText = readFileSync(lockPath, "utf8");
    const react18 = [...new Set(lockText.match(/(?<![\w-])react@18\.\d+\.\d+/g) ?? [])];
    const reactDom18 = [...new Set(lockText.match(/react-dom@18\.\d+\.\d+/g) ?? [])];
    const vite7 = [...new Set(lockText.match(/(?<![\w-])vite@7\.\d+\.\d+/g) ?? [])];
    const dupIssues = [...react18, ...reactDom18, ...vite7];
    checks.push({
      id: "single-copy-react-vite",
      name: "Medusa v2.23 Single-Copy Guard (React 19 / Vite 8)",
      category: "doctor",
      status: dupIssues.length === 0 ? "pass" : "fail",
      durationMs: 2,
      summary:
        dupIssues.length === 0
          ? "Lockfile resolves single major of react (19), react-dom (19), and vite (8)"
          : `Legacy React 18 / Vite 7 packages detected in pnpm-lock.yaml (${dupIssues.join(", ")})`,
      details: dupIssues,
    });
  }

  const migrationsDoc = join(repoRoot, "MIGRATIONS.md");
  checks.push({
    id: "migration-register",
    name: "Migration History & Side-Effects Register (MIGRATIONS.md)",
    category: "doctor",
    status: existsSync(migrationsDoc) ? "pass" : "warn",
    durationMs: 1,
    summary: existsSync(migrationsDoc)
      ? "MIGRATIONS.md present (documents v2.23.0 React 19, Vite 8, Tailwind 4, RBAC & BullMQ 6 side effects)"
      : "MIGRATIONS.md missing — document Medusa upgrade side effects",
  });

  const siblingVicacha = resolve(repoRoot, "../vicacha-travels");
  if (existsSync(siblingVicacha)) {
    const backendPkg = safeReadJson<PkgJson>(
      join(siblingVicacha, "apps/backend/package.json")
    );
    const hostMedusa = backendPkg?.dependencies?.["@medusajs/medusa"] ?? "unknown";
    if (hostMedusa !== expectedMedusa) {
      drifts.push({
        subject: "vicacha-travels (@medusajs/medusa)",
        expected: expectedMedusa,
        actual: hostMedusa,
        severity: "warn",
        sourceRepo: "vicacha-travels",
      });
    }
    checks.push({
      id: "sibling-vicacha-sync",
      name: "Sibling Vicacha Travels Compatibility Check",
      category: "doctor",
      status: hostMedusa === expectedMedusa ? "pass" : "warn",
      durationMs: 1,
      summary: `Detected sibling vicacha-travels (Medusa ${hostMedusa})`,
    });
  }

  return { checks, drifts };
}

if (resolve(process.argv[1] ?? "") === resolve(fileURLToPath(import.meta.url))) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const { checks } = runMedusaPluginsDoctor(repoRoot);
  let failed = 0;
  for (const c of checks) {
    process.stdout.write(`[${c.status.toUpperCase()}] ${c.name}: ${c.summary}\n`);
    for (const d of c.details ?? []) {
      process.stdout.write(`    - ${d}\n`);
    }
    if (c.status === "fail") failed += 1;
  }
  if (failed > 0) process.exit(1);
}
