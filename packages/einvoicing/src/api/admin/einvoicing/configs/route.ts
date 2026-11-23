import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { EINVOICING_MODULE } from "../../../../modules/einvoicing"
import type EinvoicingModuleService from "../../../../modules/einvoicing/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve(
    EINVOICING_MODULE
  ) as EinvoicingModuleService
  const configs = await service.listFiscalConfigs({})
  res.json({ configs })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve(
    EINVOICING_MODULE
  ) as EinvoicingModuleService
  const body = req.validatedBody as Record<string, any>
  const config = await service.createFiscalConfigs({
    country_code: String(body.country_code).toUpperCase(),
    driver_id: String(body.driver_id),
    is_active: body.is_active ?? true,
    environment: body.environment ?? "sandbox",
    issuer_tax_id: String(body.issuer_tax_id),
    issuer_name: String(body.issuer_name),
    prefix: body.prefix ?? "INV",
    next_number: Number(body.next_number ?? 1),
    settings: body.settings ?? null,
  })
  res.status(201).json({ config })
}
