import { registerHooks, stripTypeScriptTypes } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      context.parentURL
    ) {
      const parentDir = dirname(fileURLToPath(context.parentURL));
      const base = resolvePath(parentDir, specifier);
      const withoutJs = base.endsWith(".js") ? base.slice(0, -3) : base;
      for (const ext of [".ts", ".tsx", "/index.ts", "/index.tsx"]) {
        const candidate = `${withoutJs}${ext}`;
        if (existsSync(candidate)) {
          return { url: pathToFileURL(candidate).href, shortCircuit: true };
        }
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith(".ts") || url.endsWith(".tsx")) {
      const source = readFileSync(fileURLToPath(url), "utf8");
      const stripped = stripTypeScriptTypes(source, { mode: "strip" });
      return { format: "module", source: stripped, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
