import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IPaymentModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { EMedusaFormatBoldPaymentProvider } from "@payment-bold/types/enums"

const CreateBoldPosPushSchema = z.object({
  paymentCollectionId: z.string().min(1),
  amount: z.coerce.number().finite().positive(),
  currency: z.string().min(3).max(3).default("COP"),
  reference: z.string().min(1).max(255),
  terminalModel: z.string().min(1).max(100),
  terminalSerial: z.string().min(1).max(100),
  userEmail: z.string().email(),
  vatAmount: z.coerce.number().finite().min(0).optional(),
  description: z.string().max(500).optional(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const parsed = CreateBoldPosPushSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid POS terminal checkout payload",
      errors: parsed.error.flatten().fieldErrors,
    })
    return
  }

  const paymentModule: IPaymentModuleService = req.scope.resolve(Modules.PAYMENT)
  const input = parsed.data

  try {
    const paymentSession = await paymentModule.createPaymentSession(
      input.paymentCollectionId,
      {
        provider_id: EMedusaFormatBoldPaymentProvider.TERMINAL,
        currency_code: input.currency.toLowerCase(),
        amount: input.amount,
        data: {
          reference: input.reference,
          terminalModel: input.terminalModel,
          terminalSerial: input.terminalSerial,
          userEmail: input.userEmail,
          vatAmount: input.vatAmount ?? 0,
          description: input.description,
        },
      }
    )

    res.status(200).json({ paymentSession })
  } catch (_error: unknown) {
    res.status(500).json({ message: "Failed to trigger terminal checkout" })
  }
}
