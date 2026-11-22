import { defineConfig } from "@playwright/test"

const baseURL = process.env.MEDUSA_SANDBOX_URL || "http://127.0.0.1:9001"

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
})
