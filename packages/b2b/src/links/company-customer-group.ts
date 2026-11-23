import { defineLink } from "@medusajs/framework/utils"
import CompanyModule from "@b2b/modules/company"
import CustomerModuleExports from "@medusajs/medusa/customer"

// CommonJS package: Node ESM yields `module.exports` (module on `.default`),
// bundlers yield the module itself. Unwrap for both.
const CustomerModule =
  (CustomerModuleExports as { default?: typeof CustomerModuleExports })
    .default ?? CustomerModuleExports

// isList on company side: one CustomerGroup → many Companies, but each Company
// still links to exactly one CustomerGroup (unique constraint on company_id only).
export default defineLink(
  { linkable: CompanyModule.linkable.company, isList: true },
  CustomerModule.linkable.customerGroup
)
