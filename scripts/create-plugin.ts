import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const packagesDir = join(repoRoot, "packages")
const sandboxDir = join(repoRoot, "apps", "sandbox")
const SLUG_RE = /^[a-z][a-z0-9-]{1,40}$/

function assertWithin(target: string, root: string): string {
  const normRoot = resolve(root)
  const normTarget = resolve(target)
  if (normTarget !== normRoot && !normTarget.startsWith(`${normRoot}${sep}`)) {
    throw new Error(`Path "${normTarget}" escapes "${normRoot}"`)
  }
  return normTarget
}

function toCamel(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_, ch: string) => ch.toUpperCase())
}

function toPascal(slug: string): string {
  const camel = toCamel(slug)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

function toDisplayName(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function parseArgs(argv: string[]) {
  const positional: string[] = []
  let displayName = ""
  let description = ""
  let withAdmin = true
  let withProvider = false
  let wireSandbox = false
  let dryRun = false

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === "--display-name" && argv[i + 1]) {
      displayName = argv[++i]
    } else if (arg === "--description" && argv[i + 1]) {
      description = argv[++i]
    } else if (arg === "--no-admin") {
      withAdmin = false
    } else if (arg === "--with-provider") {
      withProvider = true
    } else if (arg === "--wire-sandbox") {
      wireSandbox = true
    } else if (arg === "--dry-run") {
      dryRun = true
    } else if (!arg.startsWith("-")) {
      positional.push(arg)
    }
  }
  return {
    rawSlug: positional[0] ?? "",
    displayName,
    description,
    withAdmin,
    withProvider,
    wireSandbox,
    dryRun,
  }
}

const opts = parseArgs(process.argv.slice(2))
const slug = opts.rawSlug.replace(/^medusa-plugin-/, "")

if (!SLUG_RE.test(slug)) {
  console.error(
    'Usage: pnpm plugin:new -- <slug> [--display-name "..."] [--description "..."] [--with-provider] [--no-admin] [--wire-sandbox] [--dry-run]\n' +
      "Slug must match ^[a-z][a-z0-9-]{1,40}$ (e.g. loyalty-points)."
  )
  process.exit(1)
}

const folderName = slug
const pkgName = `@vicacha-devs/medusa-plugin-${slug}`
const displayName = opts.displayName || toDisplayName(slug)
const description =
  opts.description || `${displayName} plugin for Medusa v2 by Vicacha Devs.`
const moduleCamel = toCamel(slug)
const modulePascal = toPascal(slug)
const moduleKey = slug.replace(/-/g, "_")
const targetDir = assertWithin(join(packagesDir, folderName), packagesDir)

if (existsSync(targetDir)) {
  console.error(`[plugin:new] Target already exists: ${targetDir}`)
  process.exit(1)
}

const files: Record<string, string> = {
  "package.json": `${JSON.stringify(
    {
      name: pkgName,
      version: "0.1.0",
      type: "module",
      description,
      author: "Vicacha Devs",
      license: "MIT",
      files: [".medusa/server", "src", "README.md", "LICENSE", "tsconfig.json"],
      exports: {
        "./package.json": "./package.json",
        ".": {
          import: "./.medusa/server/src/index.js",
          default: "./.medusa/server/src/index.js",
        },
        ...(opts.withAdmin
          ? {
              "./admin": {
                import: "./.medusa/server/src/admin/index.js",
                default: "./.medusa/server/src/admin/index.js",
              },
            }
          : {}),
        "./sdk": {
          import: "./src/sdk/index.ts",
          default: "./.medusa/server/src/sdk/index.js",
        },
        "./types": {
          import: "./src/types/index.ts",
          default: "./.medusa/server/src/types/index.js",
        },
        "./workflows": "./.medusa/server/src/workflows/index.js",
        "./modules/*": "./.medusa/server/src/modules/*/index.js",
        ...(opts.withProvider
          ? { "./providers/*": "./.medusa/server/src/providers/*/index.js" }
          : {}),
      },
      publishConfig: { access: "public", provenance: true },
      scripts: {
        build:
          "medusa plugin:build && tsc-alias -p tsconfig.json --resolve-full-paths",
        clean: "rm -rf .medusa dist",
        dev: "medusa plugin:develop",
        lint: "medusa lint",
        prepublishOnly: "medusa plugin:build",
        test: "node --import ../plugin-testing/register-ts-resolver.mjs --import ../plugin-testing/register-js-extension.mjs --test src/__tests__/*.spec.ts",
        typecheck: "tsc --noEmit",
      },
      devDependencies: {
        "@medusajs/admin-sdk": "2.23.0",
        "@medusajs/admin-shared": "2.23.0",
        "@medusajs/cli": "2.23.0",
        "@medusajs/framework": "2.23.0",
        "@medusajs/medusa": "2.23.0",
        "@medusajs/types": "2.23.0",
        "@medusajs/ui": "4.3.0",
        "@vicacha-devs/medusa-eslint-config": "workspace:*",
        "@vicacha-devs/medusa-plugin-testing": "workspace:*",
        "@vicacha-devs/medusa-typescript-config": "workspace:*",
        react: "^19.3.1",
        "react-dom": "^19.3.1",
        "tsc-alias": "^1.9.2",
        typescript: "5.6.2",
        vite: "^8.3.8",
      },
      peerDependencies: {
        "@medusajs/admin-sdk": "2.23.0",
        "@medusajs/admin-shared": "2.23.0",
        "@medusajs/framework": "2.23.0",
        "@medusajs/medusa": "2.23.0",
        "@medusajs/ui": "4.3.0",
        react: "^19.3.1",
        "react-dom": "^19.3.1",
        zod: "4.6.7",
      },
      engines: { node: ">=22.22.0" },
    },
    null,
    2
  )}\n`,

  "tsconfig.json": `${JSON.stringify(
    {
      extends: "../../packages/typescript-config/plugin.json",
      compilerOptions: {
        rootDir: "./",
        outDir: "./.medusa/server",
        noEmit: false,
      },
      include: ["**/*", ".medusa/types/*"],
      exclude: [
        "node_modules",
        ".medusa/server",
        ".medusa/admin",
        "src/admin",
        "src/__tests__",
        "eslint.config.*",
      ],
    },
    null,
    2
  )}\n`,

  "eslint.config.ts": `import { medusaMonorepoConfig } from "@vicacha-devs/medusa-eslint-config"\n\nexport default medusaMonorepoConfig\n`,

  "README.md": `# ${pkgName}\n\n${description}\n\n## QA & Development\n\n\`\`\`bash\npnpm --filter ${pkgName} test\npnpm --filter ${pkgName} typecheck\npnpm --filter ${pkgName} build\n\`\`\`\n`,

  "src/index.ts": `export * from "./types"\nexport * from "./sdk"\nexport * from "./workflows"\n`,

  "src/types/index.ts": `export interface ${modulePascal}Record {\n  id: string\n  label: string\n  active: boolean\n}\n\nexport interface Create${modulePascal}Input {\n  label: string\n  active?: boolean\n}\n`,

  [`src/modules/${slug}/models/${slug}.ts`]: `import { model } from "@medusajs/framework/utils"\n\nexport const ${modulePascal}Model = model.define("${moduleKey}_record", {\n  id: model.id().primaryKey(),\n  label: model.text().searchable(),\n  active: model.boolean().default(true),\n})\n`,

  [`src/modules/${slug}/service.ts`]: `import { MedusaService } from "@medusajs/framework/utils"\nimport { ${modulePascal}Model } from "./models/${slug}"\n\nexport class ${modulePascal}ModuleService extends MedusaService({\n  ${modulePascal}Model,\n}) {\n  async summarize(): Promise<{ module: string; status: "ready" }> {\n    return { module: "${moduleKey}", status: "ready" }\n  }\n}\n\nexport default ${modulePascal}ModuleService\n`,

  [`src/modules/${slug}/index.ts`]: `import { Module } from "@medusajs/framework/utils"\nimport ${modulePascal}ModuleService from "./service"\n\nexport const ${moduleKey.toUpperCase()}_MODULE = "${moduleKey}"\n\nexport default Module(${moduleKey.toUpperCase()}_MODULE, {\n  service: ${modulePascal}ModuleService,\n})\n`,

  "src/workflows/index.ts": `import {\n  createStep,\n  createWorkflow,\n  StepResponse,\n  WorkflowResponse,\n} from "@medusajs/framework/workflows-sdk"\nimport type { Create${modulePascal}Input } from "../types"\n\nexport const create${modulePascal}Step = createStep(\n  "create-${slug}-step",\n  async (input: Create${modulePascal}Input) => {\n    const created = {\n      id: "${moduleKey}_1",\n      label: input.label.trim(),\n      active: input.active ?? true,\n    }\n    return new StepResponse(created, created.id)\n  }\n)\n\nexport const create${modulePascal}Workflow = createWorkflow(\n  "create-${slug}-workflow",\n  (input: Create${modulePascal}Input) => {\n    const record = create${modulePascal}Step(input)\n    return new WorkflowResponse(record)\n  }\n)\n`,

  "src/api/validators.ts": `import { z } from "zod"\n\nexport const Create${modulePascal}Schema = z.object({\n  label: z.string().min(1).max(120),\n  active: z.boolean().optional(),\n})\n`,

  "src/api/middlewares.ts": `import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http"\nimport { Create${modulePascal}Schema } from "./validators"\n\nexport default defineMiddlewares({\n  routes: [\n    {\n      matcher: "/admin/${slug}",\n      method: "POST",\n      middlewares: [validateAndTransformBody(Create${modulePascal}Schema)],\n    },\n  ],\n})\n`,

  [`src/api/admin/${slug}/route.ts`]: `import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"\nimport { create${modulePascal}Workflow } from "../../../workflows"\n\nexport async function POST(req: MedusaRequest, res: MedusaResponse) {\n  const { result } = await create${modulePascal}Workflow(req.scope).run({\n    input: req.validatedBody as { label: string; active?: boolean },\n  })\n  res.status(201).json({ record: result })\n}\n`,

  "src/sdk/index.ts": `export const ${moduleCamel}Endpoints = {\n  adminBase: "/admin/${slug}",\n  storeBase: "/store/${slug}",\n} as const\n`,

  [`src/__tests__/${slug}.spec.ts`]: `import assert from "node:assert/strict"\nimport { describe, it } from "node:test"\nimport ${modulePascal}ModuleService from "../modules/${slug}/service"\nimport { create${modulePascal}Workflow } from "../workflows"\nimport { ${moduleCamel}Endpoints } from "../sdk"\n\ndescribe("${pkgName}", () => {\n  it("summarizes module readiness and executes create workflow", async () => {\n    const service = new ${modulePascal}ModuleService()\n    const summary = await service.summarize()\n    assert.equal(summary.status, "ready")\n    assert.equal(${moduleCamel}Endpoints.adminBase, "/admin/${slug}")\n\n    const { result } = await create${modulePascal}Workflow().run({\n      input: { label: "  Smoke Item  " },\n    })\n    assert.equal(result.label, "Smoke Item")\n    assert.equal(result.active, true)\n  })\n})\n`,
}

if (opts.withAdmin) {
  files["src/admin/i18n/en.json"] = `${JSON.stringify(
    {
      title: displayName,
      empty: `No ${displayName.toLowerCase()} records yet.`,
    },
    null,
    2
  )}\n`
  files["src/admin/i18n/es.json"] = `${JSON.stringify(
    {
      title: displayName,
      empty: `Sin registros de ${displayName.toLowerCase()} aún.`,
    },
    null,
    2
  )}\n`
  files["src/admin/i18n/index.ts"] =
    `import en from "./en.json"\nimport es from "./es.json"\n\nexport const translations = { en, es } as const\n\nexport default {\n  en: { translation: en },\n  es: { translation: es },\n}\n`
}

if (opts.withProvider) {
  files[`src/providers/${slug}/index.ts`] =
    `export const providerId = "${moduleKey}-provider"\n`
}

if (opts.dryRun) {
  process.stdout.write(
    `[plugin:new] DRY RUN — would create ${pkgName} at ${targetDir}:\n`
  )
  for (const rel of Object.keys(files).toSorted()) {
    process.stdout.write(`  + ${rel}\n`)
  }
  if (opts.wireSandbox) {
    process.stdout.write(
      `  ~ apps/sandbox/package.json & apps/sandbox/medusa-config.ts\n`
    )
  }
  process.exit(0)
}

for (const [rel, content] of Object.entries(files)) {
  const fullPath = assertWithin(join(targetDir, rel), targetDir)
  mkdirSync(dirname(fullPath), { recursive: true })
  writeFileSync(fullPath, content, "utf8")
}

if (opts.wireSandbox) {
  const sandboxPkgPath = assertWithin(
    join(sandboxDir, "package.json"),
    repoRoot
  )
  const sandboxPkg = JSON.parse(readFileSync(sandboxPkgPath, "utf8")) as {
    dependencies: Record<string, string>
  }
  sandboxPkg.dependencies[pkgName] = "workspace:*"
  const sortedDeps = Object.fromEntries(
    Object.entries(sandboxPkg.dependencies).toSorted(([a], [b]) =>
      a.localeCompare(b)
    )
  )
  sandboxPkg.dependencies = sortedDeps
  writeFileSync(
    sandboxPkgPath,
    `${JSON.stringify(sandboxPkg, null, 2)}\n`,
    "utf8"
  )

  const configPath = assertWithin(
    join(sandboxDir, "medusa-config.ts"),
    repoRoot
  )
  const configSrc = readFileSync(configPath, "utf8")
  if (!configSrc.includes(`"${pkgName}"`)) {
    const updated = configSrc.replace(
      "  ],\n})",
      `    { resolve: "${pkgName}", options: {} },\n  ],\n})`
    )
    writeFileSync(configPath, updated, "utf8")
  }
}

process.stdout.write(
  `[plugin:new] Created ${pkgName} (${Object.keys(files).length} files).\n` +
    `Next: node --import ./packages/plugin-testing/register-ts-resolver.mjs --import ./packages/plugin-testing/register-js-extension.mjs --test packages/${folderName}/src/__tests__/*.spec.ts\n`
)
