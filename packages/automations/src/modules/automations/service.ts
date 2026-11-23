import { MedusaService } from "@medusajs/framework/utils"
import type {
  AutomationActionConfig,
  AutomationActionHandler,
  AutomationActionResult,
  AutomationCondition,
  AutomationTriggerType,
} from "../../types"
import { createBuiltInActionHandlers } from "./actions/built-in-handlers"
import { AutomationExecutionLogModel } from "./models/automation-execution-log"
import { AutomationRuleModel } from "./models/automation-rule"
import { evaluateConditions } from "./utils/rule-evaluator"

export interface ExecuteRuleParams {
  rule: Record<string, any>
  triggerType: AutomationTriggerType
  eventName: string
  context: Record<string, any>
  container: any
}

export class AutomationsModuleService extends MedusaService({
  AutomationRule: AutomationRuleModel,
  AutomationExecutionLog: AutomationExecutionLogModel,
}) {
  private readonly handlers_ = new Map<string, AutomationActionHandler>()

  constructor(
    container: Record<string, unknown>,
    options?: { actionHandlers?: AutomationActionHandler[] }
  ) {
    super(container, options)
    for (const handler of createBuiltInActionHandlers()) {
      this.handlers_.set(handler.id, handler)
    }
    for (const custom of options?.actionHandlers ?? []) {
      this.handlers_.set(custom.id, custom)
    }
  }

  async registerActionHandler(handler: AutomationActionHandler): Promise<void> {
    this.handlers_.set(handler.id, handler)
  }

  async listActionHandlers(): Promise<
    Array<{
      id: string
      label: string
      description?: string
      enabled: boolean
      fields: AutomationActionHandler["fields"]
    }>
  > {
    return [...this.handlers_.values()].map((h) => ({
      id: h.id,
      label: h.label,
      description: h.description,
      enabled: h.enabled ?? true,
      fields: h.fields ?? [],
    }))
  }

  async executeRule({
    rule,
    triggerType,
    eventName,
    context,
    container,
  }: ExecuteRuleParams): Promise<{
    status: "success" | "failed" | "skipped"
    results: AutomationActionResult[]
  }> {
    const conditions = (rule.conditions ?? []) as AutomationCondition[]
    if (!evaluateConditions(conditions, context)) {
      await this.createAutomationExecutionLogs({
        rule_id: String(rule.id),
        trigger_type: triggerType,
        event_name: eventName,
        status: "skipped",
        actions_executed: 0,
        result_summary: { reason: "conditions_not_met" },
      })
      return { status: "skipped", results: [] }
    }

    const actions = (
      Array.isArray(rule.actions) ? rule.actions : []
    ) as AutomationActionConfig[]
    const results: AutomationActionResult[] = []
    let failed = false

    for (const action of actions) {
      const handler = this.handlers_.get(action.type)
      if (!handler || handler.enabled === false) {
        results.push({
          success: false,
          message: `Action handler '${action.type}' not found or disabled`,
        })
        failed = true
        continue
      }

      try {
        const res = await handler.executeAction({
          trigger: { type: triggerType, event_name: eventName },
          action,
          context,
          container,
          eventName,
        })
        results.push(res)
        if (!res.success) failed = true
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Action execution error"
        results.push({ success: false, message: msg })
        failed = true
      }
    }

    const status = failed ? "failed" : "success"
    await this.createAutomationExecutionLogs({
      rule_id: String(rule.id),
      trigger_type: triggerType,
      event_name: eventName,
      status,
      actions_executed: results.length,
      result_summary: { results },
      error_message: failed
        ? results.find((r) => !r.success)?.message || "Action failed"
        : null,
    })

    await this.updateAutomationRules({
      id: String(rule.id),
      run_count: Number(rule.run_count || 0) + 1,
      last_run_at: new Date(),
    })

    return { status, results }
  }
}

export default AutomationsModuleService
