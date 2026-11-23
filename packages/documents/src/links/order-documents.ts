import { defineLink } from "@medusajs/framework/utils"
import OrderModuleExports from "@medusajs/medusa/order"
import DocumentsModule from "../modules/documents"

// CommonJS package: Node ESM yields `module.exports` (module on `.default`),
// bundlers yield the module itself. Unwrap for both.
const OrderModule =
  (OrderModuleExports as { default?: typeof OrderModuleExports }).default ??
  OrderModuleExports

export default defineLink(OrderModule.linkable.order, {
  linkable: DocumentsModule.linkable.mpdDocument,
  isList: true,
})
