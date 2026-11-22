import medusaPlugin from "@medusajs/eslint-plugin"

export const medusaMonorepoConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.medusa/**",
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
      "**/.qa/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
    ],
  },
  ...medusaPlugin.configs.recommended,
]

export default medusaMonorepoConfig
