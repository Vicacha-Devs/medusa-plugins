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
  res.json({ drivers: await service.listDrivers() })
}
