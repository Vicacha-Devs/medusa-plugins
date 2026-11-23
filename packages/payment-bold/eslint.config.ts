import { defineConfig } from "eslint/config"
import medusa from "@medusajs/eslint-plugin"

export default defineConfig([
  ...medusa.configs.recommended,
  {
    // Only top-level files under admin/widgets are Medusa widgets; nested
    // components/hooks are plain modules, not widget entrypoints.
    files: [
      "src/admin/widgets/**/components/**/*.{ts,tsx}",
      "src/admin/widgets/**/hooks/**/*.{ts,tsx}",
    ],
    rules: {
      "@medusajs/widget-must-export-config": "off",
      "@medusajs/widget-must-have-default-export": "off",
    },
  },
])
