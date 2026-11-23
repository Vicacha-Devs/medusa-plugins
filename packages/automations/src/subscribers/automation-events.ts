import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { evaluateAndExecuteAutomationsWorkflow } from "../workflows"

export default async function automationEventsSubscriber({
  event: { name, data },
  container,
}: SubscriberArgs<Record<string, any>>) {
  if (!name) return
  try {
    await evaluateAndExecuteAutomationsWorkflow(container).run({
      input: {
        trigger_type: "event",
        event_name: name,
        context: data || {},
      },
    })
  } catch {
    // Non-blocking in event subscriber so commerce lifecycle never fails
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.placed",
    "order.completed",
    "order.canceled",
    "customer.created",
    "product.created",
    "product.updated",
    "inventory-level.updated",
  ],
}
