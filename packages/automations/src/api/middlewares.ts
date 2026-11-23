import {
  authenticate,
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import {
  createAutomationRuleSchema,
  triggerAutomationRuleSchema,
  updateAutomationRuleSchema,
} from "./validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/automations*",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    {
      matcher: "/admin/automations",
      method: "POST",
      middlewares: [validateAndTransformBody(createAutomationRuleSchema)],
    },
    {
      matcher: "/admin/automations/:id",
      method: "PATCH",
      middlewares: [validateAndTransformBody(updateAutomationRuleSchema)],
    },
    {
      matcher: "/admin/automations/:id/trigger",
      method: "POST",
      middlewares: [validateAndTransformBody(triggerAutomationRuleSchema)],
    },
  ],
})
