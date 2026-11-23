import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "cart.id",
      "cart.locale",
      "cart.currency_code",
      "cart.created_at",
      "cart.updated_at",
      "cart.metadata",
      "cart.payment_collection.id",
      "cart.payment_collection.status",
      "cart.payment_collection.amount",
      "cart.payment_collection.currency_code",
      "cart.payment_collection.payment_sessions.id",
      "cart.payment_collection.payment_sessions.provider_id",
      "cart.payment_collection.payment_sessions.status",
      "cart.payment_collection.payment_sessions.amount",
      "cart.payment_collection.payment_sessions.currency_code",
      "cart.payment_collection.payment_sessions.data",
      "cart.payment_collection.payment_sessions.created_at",
    ],
    filters: { id },
  })

  const order = orders?.[0] as Record<string, any> | undefined
  if (!order?.cart) {
    res.status(404).json({
      message: `No linked cart found for order ${id}`,
    })
    return
  }

  res.json({ cart: order.cart })
}
