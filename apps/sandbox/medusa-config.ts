import crypto from "node:crypto"
import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

function resolveSandboxSecret(envKey: string): string {
  const existing = process.env[envKey]
  if (existing && existing.length >= 16) {
    return existing
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${envKey} must be set in production`)
  }
  console.warn(
    `[SECURITY WARNING] ${envKey} not set; generating ephemeral sandbox secret (instance-isolated).`
  )
  return crypto.randomBytes(32).toString("hex")
}

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    databaseDriverOptions: {
      ssl: false,
      sslmode: "disable",
    },
    http: {
      storeCors:
        process.env.STORE_CORS || "http://127.0.0.1:8000,http://localhost:8000",
      adminCors:
        process.env.ADMIN_CORS || "http://127.0.0.1:9001,http://localhost:9001",
      authCors:
        process.env.AUTH_CORS || "http://127.0.0.1:9001,http://localhost:9001",
      jwtSecret: resolveSandboxSecret("JWT_SECRET"),
      cookieSecret: resolveSandboxSecret("COOKIE_SECRET"),
    },
  },
  admin: {
    vite: () => ({
      server: {
        host: "127.0.0.1",
        allowedHosts: ["localhost", "127.0.0.1"],
      },
    }),
  },
  plugins: [
    { resolve: "@vicacha-devs/medusa-fulfillment-eu", options: {} },
    { resolve: "@vicacha-devs/medusa-payment-bold", options: {} },
    { resolve: "@vicacha-devs/medusa-payment-mollie", options: {} },
    { resolve: "@vicacha-devs/medusa-plugin-automations", options: {} },
    { resolve: "@vicacha-devs/medusa-plugin-b2b", options: {} },
    { resolve: "@vicacha-devs/medusa-plugin-barcode", options: {} },
    { resolve: "@vicacha-devs/medusa-plugin-dian", options: {} },
    { resolve: "@vicacha-devs/medusa-plugin-documents", options: {} },
    { resolve: "@vicacha-devs/medusa-plugin-notifications", options: {} },
    { resolve: "@vicacha-devs/medusa-plugin-odoo", options: {} },
    { resolve: "@vicacha-devs/medusa-plugin-product-extensions", options: {} },
    { resolve: "@vicacha-devs/medusa-plugin-social-commerce", options: {} },
    { resolve: "@vicacha-devs/medusa-plugin-stories", options: {} },
    { resolve: "@vicacha-devs/medusa-plugin-typesense", options: {} },
    { resolve: "@vicacha-devs/medusa-plugin-einvoicing", options: {} },
  ],
})
