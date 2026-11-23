import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IPaymentModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { EMedusaFormatBoldPaymentProvider } from "@payment-bold/types/enums"

const CreateBoldButtonSchema = z.object({
  paymentCollectionId: z.string().min(1),
  amount: z.coerce.number().finite().positive(),
  currency: z.string().min(3).max(3).default("COP"),
  reference: z.string().min(1).max(255),
  description: z.string().min(1).max(500).optional(),
  email: z.string().email().optional(),
  taxAmount: z.coerce.number().finite().min(0).optional(),
})

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const parsed = CreateBoldButtonSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid payment button payload",
      errors: parsed.error.flatten().fieldErrors,
    })
    return
  }

  const paymentModule: IPaymentModuleService = req.scope.resolve(
    Modules.PAYMENT
  )
  const input = parsed.data

  try {
    const paymentSession = await paymentModule.createPaymentSession(
      input.paymentCollectionId,
      {
        provider_id: EMedusaFormatBoldPaymentProvider.BUTTON,
        currency_code: input.currency.toLowerCase(),
        amount: input.amount,
        data: {
          reference: input.reference,
          description: input.description,
          email: input.email,
          taxAmount: input.taxAmount,
        },
      }
    )

    res.status(200).json({ paymentSession })
  } catch {
    res
      .status(500)
      .json({ message: "Failed to initialize Bold payment button session" })
  }
}
