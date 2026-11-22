import crypto from "node:crypto"
import { BoldQaEmulator } from "../src/__tests__/bold-qa-emulator.ts"

const port = Number.parseInt(process.env.BOLD_EMULATOR_PORT || "4010", 10)
const integrationApiKey =
  process.env.BOLD_INTEGRATION_API_KEY || crypto.randomBytes(16).toString("hex")
const buttonApiKey =
  process.env.BOLD_BUTTON_API_KEY || crypto.randomBytes(16).toString("hex")
const webhookSecret =
  process.env.BOLD_WEBHOOK_SECRET || crypto.randomBytes(24).toString("hex")

const emulator = new BoldQaEmulator({
  integrationApiKey,
  buttonApiKey,
  webhookSecret,
})

const url = await emulator.start(port)
process.stdout.write(
  `[bold-emulator] Listening on ${url} (loopback only)\n` +
    `  BOLD_INTEGRATIONS_URL=${url}\n` +
    `  BOLD_ONLINE_URL=${url}\n` +
    `  BOLD_PAYMENTS_URL=${url}/v2/payment-voucher\n` +
    `  Simulate payment: POST ${url}/__qa/simulate-payment\n`
)

process.on("SIGINT", async () => {
  await emulator.stop()
  process.exit(0)
})
process.on("SIGTERM", async () => {
  await emulator.stop()
  process.exit(0)
})
