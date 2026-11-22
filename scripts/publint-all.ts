import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = join(rootDir, "packages");

interface PkgManifest {
  name: string;
  version?: string;
  private?: boolean;
  files?: string[];
  exports?: Record<string, unknown>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

const allDirs = existsSync(packagesDir)
  ? readdirSync(packagesDir, { withFileTypes: true }).filter((e) =>
      e.isDirectory()
    )
  : [];

const privatePackages = new Set<string>();
for (const entry of allDirs) {
  const pkgPath = join(packagesDir, entry.name, "package.json");
  if (!existsSync(pkgPath)) continue;
  const manifest = JSON.parse(readFileSync(pkgPath, "utf8")) as PkgManifest;
  if (manifest.private && manifest.name) {
    privatePackages.add(manifest.name);
  }
}

const pluginDirs = allDirs
  .filter((e) => {
    const pkgPath = join(packagesDir, e.name, "package.json");
    if (!existsSync(pkgPath)) return false;
    const manifest = JSON.parse(readFileSync(pkgPath, "utf8")) as PkgManifest;
    return Boolean(
      !manifest.private && manifest.name?.startsWith("@vicacha-devs/medusa-")
    );
  })
  .map((e) => join(packagesDir, e.name))
  .sort();

let publintFn:
  | ((opts: {
      pkgDir: string;
      pack: "pnpm";
      strict: boolean;
    }) => Promise<{ messages: Array<{ code: string; message?: string }> }>)
  | null = null;

try {
  const mod = (await import("publint")) as { publint?: typeof publintFn };
  publintFn = mod.publint ?? null;
} catch {
  publintFn = null;
}

let totalErrors = 0;

for (const pkgDir of pluginDirs) {
  const manifest = JSON.parse(
    readFileSync(join(pkgDir, "package.json"), "utf8")
  ) as PkgManifest;
  const issues: string[] = [];

  if (!manifest.name?.startsWith("@vicacha-devs/")) {
    issues.push(`Expected scoped @vicacha-devs/* name, got "${manifest.name}"`);
  }
  if (!Array.isArray(manifest.files) || !manifest.files.includes(".medusa/server")) {
    issues.push('Missing ".medusa/server" in package.json "files"');
  }
  if (!manifest.exports || !manifest.exports["./package.json"]) {
    issues.push('Missing "./package.json" in package.json "exports"');
  }

  for (const field of [
    "dependencies",
    "peerDependencies",
    "optionalDependencies",
  ] as const) {
    const map = manifest[field];
    if (!map) continue;
    for (const dep of Object.keys(map)) {
      if (privatePackages.has(dep)) {
        issues.push(`Private workspace package "${field}.${dep}" leaked`);
      }
    }
  }

  for (const [scriptName, cmd] of Object.entries(manifest.scripts ?? {})) {
    if (cmd.includes("/Users/") || cmd.includes("gweb-uniblog")) {
      issues.push(`Hardcoded machine path in scripts.${scriptName}`);
    }
  }

  if (publintFn && existsSync(join(pkgDir, ".medusa", "server"))) {
    const { messages } = await publintFn({
      pkgDir,
      pack: "pnpm",
      strict: false,
    });
    for (const m of messages as Array<{
      code: string;
      type?: string;
      message?: string;
    }>) {
      if (m.type === "error") {
        issues.push(`publint[${m.code}]: ${m.message ?? m.code}`);
      }
    }
  }

  if (issues.length === 0) {
    process.stdout.write(`[publint] PASS ${manifest.name}\n`);
  } else {
    console.error(`[publint] FAIL ${manifest.name} (${issues.length}):`);
    for (const issue of issues) {
      console.error(`  - ${issue}`);
    }
    totalErrors += issues.length;
  }
}

if (totalErrors > 0) {
  console.error(`\n[publint] Failed with ${totalErrors} issue(s).`);
  process.exit(1);
}

process.stdout.write(
  `\n[publint] All ${pluginDirs.length} Medusa plugins passed manifest validation.\n`
);
