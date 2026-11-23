import { z } from "@medusajs/framework/zod"

export const conditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum([
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "in",
    "not_in",
    "contains",
    "not_contains",
    "exists",
    "not_exists",
  ]),
  value: z.unknown().optional(),
})

export const actionConfigSchema = z.object({
  type: z.string().min(1),
  config: z.record(z.string(), z.unknown()).optional(),
})

export const createAutomationRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  trigger_type: z.enum(["event", "schedule", "manual"]).optional(),
  event_name: z.string().nullable().optional(),
  cron_expression: z.string().nullable().optional(),
  conditions: z.array(conditionSchema).optional(),
  actions: z.array(actionConfigSchema).min(1),
  is_active: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
})

export const updateAutomationRuleSchema = createAutomationRuleSchema.partial()

export const triggerAutomationRuleSchema = z.object({
  context: z.record(z.string(), z.unknown()).optional(),
  event_name: z.string().optional(),
})
