import { model } from "@medusajs/framework/utils"

export const AutomationRuleModel = model.define("automation_rule", {
  id: model.id().primaryKey(),
  name: model.text().searchable(),
  description: model.text().nullable(),
  trigger_type: model.enum(["event", "schedule", "manual"]).default("event"),
  event_name: model.text().nullable(),
  cron_expression: model.text().nullable(),
  conditions: model.json().nullable(),
  actions: model.json(),
  is_active: model.boolean().default(true),
  run_count: model.number().default(0),
  last_run_at: model.dateTime().nullable(),
  metadata: model.json().nullable(),
})
