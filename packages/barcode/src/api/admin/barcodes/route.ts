import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import type { BarcodeModuleService } from "../../../modules/barcode/service"
import { BARCODE_MODULE } from "../../../modules/barcode/types"

const AdminListBarcodesQuerySchema = z.object({
  product_id: z.string().min(1).max(256).optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const parsed = AdminListBarcodesQuerySchema.safeParse(req.query || {})
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid query parameters",
      errors: parsed.error.flatten().fieldErrors,
    })
  }

  const barcodeService = req.scope.resolve(
    BARCODE_MODULE
  ) as BarcodeModuleService

  const productId = parsed.data.product_id
  const filter = productId ? { product_id: productId } : {}

  const [barcodeProducts, overview] = await Promise.all([
    barcodeService.listBarcodeProducts(filter, { take: 200 }),
    barcodeService.getAnalyticsOverview(),
  ])

  res.json({
    barcodes: barcodeProducts,
    count: barcodeProducts.length,
    overview,
  })
}
