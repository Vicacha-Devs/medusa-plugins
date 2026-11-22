import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { IPaymentModuleService, Logger } from "@medusajs/framework/types"
import { BoldIntegrityService } from "../../../../services/integrity"
import { BOLD_PAYMENT_PROVIDERS } from "@payment-bold/types/constants"

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const logger: Logger = req.scope.resolve("logger")

  try {
    const signatureHeader = (
      req.headers["x-bold-signature"] || 
      req.headers["x-signature"]
    ) as string

    const timestampHeader = (
      req.headers["x-bold-timestamp"] || 
      req.headers["x-timestamp"]
    ) as string

    // 1. Resolve Bold configuration from any available provider (provider-agnostic)
    let options: any = {}
    for (const providerId of BOLD_PAYMENT_PROVIDERS) {
      try {
        const provider = req.scope.resolve(providerId) as any
        if (provider?.options_) {
          options = provider.options_
          logger.debug(`[Bold Webhook] Configuration loaded from provider: ${providerId}`)
          break
        }
      } catch {
        // Provider not registered, try next one
        continue
      }
    }

    // 2. Collect all configured Bold webhook signing secrets (fail-closed if none)
    const possibleSecrets = [
      options?.buttonSecretKey,
      options?.integrationSecretKey,
    ].filter((secret): secret is string => typeof secret === "string" && secret.length > 0)

    if (possibleSecrets.length === 0) {
      logger.error("[Bold Webhook] No Bold payment provider signing key configured")
      res.status(500).json({ message: "Webhook signing key is not configured" })
      return
    }

    const rawBody = (req as any).rawBody || JSON.stringify(req.body ?? {})

    // 3. Verify webhook signature against configured secret keys (fail-closed)
    if (!signatureHeader || !timestampHeader) {
      logger.warn("[Bold Webhook] Missing signature or timestamp header.")
      res.status(401).json({ message: "Missing webhook signature headers" })
      return
    }

    const isValid = possibleSecrets.some((secretKey) =>
      BoldIntegrityService.verifyWebhookSignature(
        rawBody,
        signatureHeader,
        timestampHeader,
        secretKey
      )
    )

    if (!isValid) {
      logger.warn("[Bold Webhook] Signature verification failed against configured secret keys.")
      res.status(401).json({ message: "Invalid webhook signature" })
      return
    }

    const payload = req.body as Record<string, any>
    const eventType = payload?.event
    const data = payload?.data

    logger.info(`[Bold Webhook] Received event '${eventType}' for reference '${data?.reference}'`)

    // 4. Capture payment in Medusa DB on successful sale
    if (eventType === "sale.successful" && (data?.status === "APPROVED" || data?.status === "PAID")) {
      const reference = data?.reference
      const paymentModule: IPaymentModuleService = req.scope.resolve(Modules.PAYMENT)

      if (reference) {
        const paymentSessions = await paymentModule.listPaymentSessions({
          status: "pending",
        } as any)

        const matchingSession = paymentSessions.find((session) => {
          const sData = (session.data || {}) as Record<string, any>
          const isMatch =
            sData.reference === reference ||
            sData.payment_link_id === reference ||
            sData.payment_link === reference ||
            session.id === reference

          if (!isMatch || session.status !== "pending") {
            return false
          }

          // Verify amount/currency when provided by webhook payload
          const webhookAmount = Number(data?.amount?.total ?? data?.amount)
          if (Number.isFinite(webhookAmount) && session.amount !== undefined) {
            if (Math.round(Number(session.amount)) !== Math.round(webhookAmount)) {
              return false
            }
          }
          if (typeof data?.currency === "string" && session.currency_code) {
            if (session.currency_code.toUpperCase() !== data.currency.toUpperCase()) {
              return false
            }
          }

          return true
        })

        if (matchingSession) {
          await paymentModule.authorizePaymentSession(matchingSession.id, {})
          logger.info(`[Bold Webhook] Payment session authorized successfully: ${matchingSession.id}`)
        } else {
          logger.warn(`[Bold Webhook] No matching pending session found for reference: ${reference}`)
        }
      }
    }

    res.status(200).json({ received: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`[Bold Webhook Error] ${message}`)
    res.status(500).json({ message: "Webhook processing failed" })
  }
}
