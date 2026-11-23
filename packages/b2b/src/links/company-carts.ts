import { defineLink } from "@medusajs/framework/utils"
import CartModuleExports from "@medusajs/medusa/cart"
import CompanyModule from "@b2b/modules/company"

// CommonJS package: Node ESM yields `module.exports` (module on `.default`),
// bundlers yield the module itself. Unwrap for both.
const CartModule =
  (CartModuleExports as { default?: typeof CartModuleExports }).default ??
  CartModuleExports

export default defineLink(CompanyModule.linkable.company, {
  linkable: CartModule.linkable.cart,
  isList: true,
})
