import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { createBoldPaymentLinkWorkflow } from "@payment-bold/workflows/create-bold-payment-link"

const CreateBoldPaymentLinkSchema = z.object({
  paymentCollectionId: z.string().min(1).optional(),
  amount: z.coerce.number().finite().positive(),
  currency: z.string().min(3).max(3).transform((s) => s.toUpperCase()),
  reference: z.string().min(1).max(255),
  description: z.string().min(1).max(500),
  email: z.string().email(),
  callbackUrl: z.string().url().refine(
    (u) => u.startsWith("https://") || u.startsWith("http://"),
    { message: "callbackUrl must use http:// or https://" }
  ),
  vatAmount: z.coerce.number().finite().min(0).optional().default(0),
  consumptionTaxAmount: z.coerce.number().finite().min(0).optional(),
  imageUrl: z
    .string()
    .url()
    .refine((u) => u.startsWith("https://") || u.startsWith("http://"), {
      message: "imageUrl must use http:// or https://",
    })
    .optional(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const parsed = CreateBoldPaymentLinkSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid payment link payload",
      errors: parsed.error.flatten().fieldErrors,
    })
    return
  }

  const input = parsed.data

  try {
    const { result } = await createBoldPaymentLinkWorkflow(req.scope).run({
      input: {
        paymentCollectionId: input.paymentCollectionId,
        amount: input.amount,
        currency: input.currency,
        reference: input.reference,
        description: input.description,
        email: input.email,
        callbackUrl: input.callbackUrl,
        vatAmount: input.vatAmount,
        consumptionTaxAmount: input.consumptionTaxAmount ?? input.vatAmount,
        imageUrl: input.imageUrl,
      },
    })

    res.status(200).json(result)
  } catch (_error: unknown) {
    res.status(500).json({ message: "Failed to execute payment workflow" })
  }
}