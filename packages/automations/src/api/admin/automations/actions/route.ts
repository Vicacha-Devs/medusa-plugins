import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { AUTOMATIONS_MODULE } from "../../../../modules/automations"
import type AutomationsModuleService from "../../../../modules/automations/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve(
    AUTOMATIONS_MODULE
  ) as AutomationsModuleService
  res.json({ actions: await service.listActionHandlers() })
}
