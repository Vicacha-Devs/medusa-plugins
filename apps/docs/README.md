# `@vicacha-devs/docs`

Starlight documentation site and interactive OpenAPI reference for the `@vicacha-devs/medusa-v2-extensions` workspace plugins.
Content under `src/content/docs` and `schemas/` is generated from the plugin packages by `scripts/sync-readmes.ts` and `scripts/generate-openapi.ts`, which run as part of `pnpm build`.

```bash
pnpm docs:dev      # generate + astro dev server on 127.0.0.1
pnpm docs:build    # generate + static build into apps/docs/dist
pnpm docs:preview  # serve the built site locally
```

## Deployment (GitHub Pages)

`.github/workflows/docs.yml` builds the site on every pull request that touches `apps/docs/**` or `packages/**` (typecheck + build, no deploy) and deploys it to GitHub Pages on pushes to `main`.

One-time repository setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

By default the workflow builds for the project URL `https://vicacha-devs.github.io/vicacha-medusa-plugins/`. To serve a custom domain instead, point a `CNAME` DNS record at `vicacha-devs.github.io`, set the domain in Settings → Pages, and set these repository variables (Settings → Secrets and variables → Actions → Variables):

| Variable | Value |
| --- | --- |
| `DOCS_SITE` | `https://medusa-plugins.vicacha.dev` |
| `DOCS_BASE` | `/` |

The same variables work locally, e.g. `DOCS_SITE=https://vicacha-devs.github.io DOCS_BASE=/vicacha-medusa-plugins pnpm docs:build`; without them the build targets the custom domain from `/`.
`src/plugins/rehype-base-links.ts` and `src/route-middleware.ts` prefix root-relative content links and landing-page hero buttons with the base path.
