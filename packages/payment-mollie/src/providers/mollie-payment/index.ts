import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import {
  B2BInvoiceProviderService,
  MolliePaymentProviderService,
} from "./service.js"

export default ModuleProvider(Modules.PAYMENT, {
  services: [MolliePaymentProviderService, B2BInvoiceProviderService],
})
