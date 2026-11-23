import { defineLink } from "@medusajs/framework/utils"
import ApprovalModule from "@b2b/modules/approval"
import CartModuleExports from "@medusajs/medusa/cart"

// CommonJS package: Node ESM yields `module.exports` (module on `.default`),
// bundlers yield the module itself. Unwrap for both.
const CartModule =
  (CartModuleExports as { default?: typeof CartModuleExports }).default ??
  CartModuleExports

export default defineLink(CartModule.linkable.cart, {
  linkable: ApprovalModule.linkable.approval,
  deleteCascade: true,
  isList: true,
})
