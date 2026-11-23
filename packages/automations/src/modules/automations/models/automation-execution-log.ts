import { model } from "@medusajs/framework/utils"

export const AutomationExecutionLogModel = model.define(
  "automation_execution_log",
  {
    id: model.id().primaryKey(),
    rule_id: model.text(),
    trigger_type: model.enum(["event", "schedule", "manual"]).default("event"),
    event_name: model.text().nullable(),
    status: model.enum(["success", "failed", "skipped"]).default("success"),
    actions_executed: model.number().default(0),
    result_summary: model.json().nullable(),
    error_message: model.text().nullable(),
  }
)
