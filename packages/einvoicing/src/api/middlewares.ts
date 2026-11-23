import {
  authenticate,
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import {
  issueFiscalDocumentSchema,
  upsertFiscalConfigSchema,
} from "./validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/einvoicing*",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    {
      matcher: "/admin/einvoicing",
      method: "POST",
      middlewares: [validateAndTransformBody(issueFiscalDocumentSchema)],
    },
    {
      matcher: "/admin/einvoicing/configs",
      method: "POST",
      middlewares: [validateAndTransformBody(upsertFiscalConfigSchema)],
    },
  ],
})
