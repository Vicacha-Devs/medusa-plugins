export type AutomationTriggerType = "event" | "schedule" | "manual"

export type RuleOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "not_in"
  | "contains"
  | "not_contains"
  | "exists"
  | "not_exists"

export interface AutomationCondition {
  field: string
  operator: RuleOperator
  value?: unknown
}

export interface AutomationActionConfig {
  type: string
  config?: Record<string, unknown>
}

export interface AutomationActionResult {
  success: boolean
  message?: string
  data?: unknown
}

export interface AutomationActionField {
  name: string
  key: string
  label: string
  type: "text" | "email" | "textarea" | "select" | "boolean" | "number"
  required?: boolean
  defaultValue?: unknown
  options?: Array<{ value: string; name: string }>
}

export interface AutomationActionHandler {
  id: string
  label: string
  description?: string
  enabled?: boolean
  fields?: AutomationActionField[]
  executeAction: (params: {
    trigger: { type: AutomationTriggerType; event_name?: string | null }
    action: AutomationActionConfig
    context: Record<string, any>
    container: any
    eventName: string
  }) => Promise<AutomationActionResult>
}

export interface CreateAutomationRuleInput {
  name: string
  description?: string | null
  trigger_type?: AutomationTriggerType
  event_name?: string | null
  cron_expression?: string | null
  conditions?: AutomationCondition[]
  actions: AutomationActionConfig[]
  is_active?: boolean
  metadata?: Record<string, unknown> | null
}

export interface UpdateAutomationRuleInput {
  id: string
  name?: string
  description?: string | null
  trigger_type?: AutomationTriggerType
  event_name?: string | null
  cron_expression?: string | null
  conditions?: AutomationCondition[]
  actions?: AutomationActionConfig[]
  is_active?: boolean
  metadata?: Record<string, unknown> | null
}

export interface CreateAutomationsInput {
  label: string
  active?: boolean
}
