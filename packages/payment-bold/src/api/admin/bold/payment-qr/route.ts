import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IPaymentModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { EMedusaFormatBoldPaymentProvider } from "@payment-bold/types/enums"

const CreateBoldQrSchema = z.object({
  paymentCollectionId: z.string().min(1),
  amount: z.coerce.number().finite().positive(),
  currency: z.string().min(3).max(3).optional(),
  currency_code: z.string().min(3).max(3).optional(),
  reference: z.string().min(1).max(255).optional(),
  description: z.string().max(500).optional(),
  callbackUrl: z.string().url().optional(),
  qrFormat: z.enum(["BOLD_BASE64", "PLAIN_BASE64", "TEXT"]).optional(),
  email: z.string().email().optional(),
})

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const parsed = CreateBoldQrSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid QR payment payload",
      errors: parsed.error.flatten().fieldErrors,
    })
    return
  }

  const paymentModule: IPaymentModuleService = req.scope.resolve(
    Modules.PAYMENT
  )
  const input = parsed.data
  const currency = (
    input.currency ||
    input.currency_code ||
    "COP"
  ).toLowerCase()

  try {
    const paymentSession = await paymentModule.createPaymentSession(
      input.paymentCollectionId,
      {
        provider_id: EMedusaFormatBoldPaymentProvider.ONLINE,
        currency_code: currency,
        amount: input.amount,
        data: {
          methodType: "qr",
          reference: input.reference,
          description: input.description,
          callbackUrl: input.callbackUrl,
          qrFormat: input.qrFormat || "BOLD_BASE64",
          email: input.email,
        },
      }
    )

    const sessionData = (paymentSession?.data || {}) as Record<string, unknown>
    res.status(200).json({
      qr_payload: (sessionData.qr_payload as string) || "",
      paymentSession,
    })
  } catch {
    res.status(500).json({ message: "Failed to generate QR payment session" })
  }
}
