import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { AUTOMATIONS_MODULE } from "../../../modules/automations"
import type AutomationsModuleService from "../../../modules/automations/service"
import type { CreateAutomationRuleInput } from "../../../types"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve(
    AUTOMATIONS_MODULE
  ) as AutomationsModuleService
  const rules = await service.listAutomationRules(
    {},
    { order: { created_at: "DESC" } }
  )
  res.json({ rules })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve(
    AUTOMATIONS_MODULE
  ) as AutomationsModuleService
  const input = req.validatedBody as CreateAutomationRuleInput
  const rule = await service.createAutomationRules({
    name: input.name,
    description: input.description ?? null,
    trigger_type: input.trigger_type ?? "event",
    event_name: input.event_name ?? null,
    cron_expression: input.cron_expression ?? null,
    conditions: (input.conditions ?? []) as unknown as Record<string, unknown>,
    actions: input.actions as unknown as Record<string, unknown>,
    is_active: input.is_active ?? true,
    metadata: input.metadata ?? null,
  })
  res.status(201).json({ rule })
}
