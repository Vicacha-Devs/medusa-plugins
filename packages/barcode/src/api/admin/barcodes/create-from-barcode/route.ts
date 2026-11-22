import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lookupAndCreateProductWorkflow } from "../../../../workflows"
import type { CreateFromBarcodeBody } from "../../../validators"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.validatedBody as CreateFromBarcodeBody
  const { result } = await lookupAndCreateProductWorkflow(req.scope).run({
    input: body as Parameters<typeof lookupAndCreateProductWorkflow>[0] extends never
      ? never
      : any,
  })

  res.status(201).json(result)
}
