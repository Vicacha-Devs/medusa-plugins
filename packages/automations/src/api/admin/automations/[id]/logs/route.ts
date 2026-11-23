import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { AUTOMATIONS_MODULE } from "../../../../../modules/automations"
import type AutomationsModuleService from "../../../../../modules/automations/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve(
    AUTOMATIONS_MODULE
  ) as AutomationsModuleService
  const logs = await service.listAutomationExecutionLogs(
    { rule_id: req.params.id },
    { order: { created_at: "DESC" }, take: 50 }
  )
  res.json({ logs })
}
