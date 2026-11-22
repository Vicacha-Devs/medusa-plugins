import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { refundBoldPaymentWorkflow } from "@payment-bold/workflows/create-bold-refund";

const RefundBoldPaymentSchema = z.object({
  payment_id: z.string().min(1),
  amount: z.coerce.number().finite().positive(),
  note: z.string().max(500).optional(),
})

export const POST = async (
  req: AuthenticatedMedusaRequest<{ payment_id: string; amount: number; note?: string }>,
  res: MedusaResponse
) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const parsed = RefundBoldPaymentSchema.safeParse(req.body ?? {})

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid refund payload",
      errors: parsed.error.flatten().fieldErrors,
    })
  }

  const { payment_id, amount, note } = parsed.data

  try {
    const { result } = await refundBoldPaymentWorkflow(req.scope).run({
      input: {
        paymentId: payment_id,
        amount,
        note,
      },
    })

    return res.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(`[Bold Refund Route] Error executing refund workflow: ${message}`)
    return res.status(500).json({
      message: "Failed to process refund",
    })
  }
}
