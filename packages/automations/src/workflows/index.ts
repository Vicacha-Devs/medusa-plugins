import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { AUTOMATIONS_MODULE } from "../modules/automations"
import type AutomationsModuleService from "../modules/automations/service"
import type { AutomationTriggerType } from "../types"

export interface DispatchAutomationEventInput {
  trigger_type: AutomationTriggerType
  event_name: string
  context: Record<string, any>
  rule_id?: string
}

export const evaluateAndExecuteAutomationsStep = createStep(
  "evaluate-and-execute-automations",
  async (input: DispatchAutomationEventInput, { container }) => {
    const service = container.resolve(
      AUTOMATIONS_MODULE
    ) as AutomationsModuleService

    const filters: Record<string, unknown> = input.rule_id
      ? { id: input.rule_id }
      : {
          is_active: true,
          trigger_type: input.trigger_type,
          event_name: input.event_name,
        }

    const rules = await service.listAutomationRules(filters)
    const executions = []
    for (const rule of rules) {
      const outcome = await service.executeRule({
        rule,
        triggerType: input.trigger_type,
        eventName: input.event_name,
        context: input.context || {},
        container,
      })
      executions.push({ rule_id: rule.id, ...outcome })
    }

    return new StepResponse({ matched_rules: rules.length, executions })
  }
)

export const evaluateAndExecuteAutomationsWorkflow = createWorkflow(
  "evaluate-and-execute-automations",
  (input: DispatchAutomationEventInput) => {
    const result = evaluateAndExecuteAutomationsStep(input)
    return new WorkflowResponse(result)
  }
)
