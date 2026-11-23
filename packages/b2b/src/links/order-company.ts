import { defineLink } from "@medusajs/framework/utils"
import OrderModuleExports from "@medusajs/medusa/order"
import CompanyModule from "@b2b/modules/company"

// CommonJS package: Node ESM yields `module.exports` (module on `.default`),
// bundlers yield the module itself. Unwrap for both.
const OrderModule =
  (OrderModuleExports as { default?: typeof OrderModuleExports }).default ??
  OrderModuleExports

export default defineLink(
  OrderModule.linkable.order,
  CompanyModule.linkable.company
)
