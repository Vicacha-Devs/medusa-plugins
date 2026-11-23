import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { evaluateAndExecuteAutomationsWorkflow } from "../../../../../workflows"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const body = (req.validatedBody || {}) as {
    context?: Record<string, unknown>
    event_name?: string
  }
  const { result } = await evaluateAndExecuteAutomationsWorkflow(req.scope).run(
    {
      input: {
        trigger_type: "manual",
        event_name: body.event_name || "manual.trigger",
        context: body.context || {},
        rule_id: req.params.id,
      },
    }
  )
  res.json({ execution: result })
}
