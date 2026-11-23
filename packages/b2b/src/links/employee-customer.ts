import { defineLink } from "@medusajs/framework/utils"
import CustomerModuleExports from "@medusajs/medusa/customer"
import CompanyModule from "@b2b/modules/company"

// CommonJS package: Node ESM yields `module.exports` (module on `.default`),
// bundlers yield the module itself. Unwrap for both.
const CustomerModule =
  (CustomerModuleExports as { default?: typeof CustomerModuleExports })
    .default ?? CustomerModuleExports

export default defineLink(
  CompanyModule.linkable.employee,
  CustomerModule.linkable.customer
)
