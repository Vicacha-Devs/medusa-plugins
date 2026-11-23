import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { AUTOMATIONS_MODULE } from "../../../../modules/automations"
import type AutomationsModuleService from "../../../../modules/automations/service"
import type { UpdateAutomationRuleInput } from "../../../../types"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve(
    AUTOMATIONS_MODULE
  ) as AutomationsModuleService
  const rules = await service.listAutomationRules({ id: req.params.id })
  if (!rules[0]) {
    res.status(404).json({ message: "Automation rule not found" })
    return
  }
  res.json({ rule: rules[0] })
}

export async function PATCH(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve(
    AUTOMATIONS_MODULE
  ) as AutomationsModuleService
  const { conditions, actions, ...rest } = req.validatedBody as Omit<
    UpdateAutomationRuleInput,
    "id"
  >
  const rule = await service.updateAutomationRules({
    id: req.params.id,
    ...rest,
    ...(conditions !== undefined
      ? { conditions: conditions as unknown as Record<string, unknown> }
      : {}),
    ...(actions !== undefined
      ? { actions: actions as unknown as Record<string, unknown> }
      : {}),
  })
  res.json({ rule })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve(
    AUTOMATIONS_MODULE
  ) as AutomationsModuleService
  await service.deleteAutomationRules([req.params.id])
  res.json({ id: req.params.id, deleted: true })
}
