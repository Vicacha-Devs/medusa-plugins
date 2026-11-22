import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { EuFulfillmentProviderService } from "./service.js"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [EuFulfillmentProviderService],
})
