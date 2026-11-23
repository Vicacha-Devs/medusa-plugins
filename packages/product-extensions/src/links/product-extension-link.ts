import { defineLink } from "@medusajs/framework/utils"
import ProductModuleExports from "@medusajs/medusa/product"
import ProductExtModule from "../modules/product-ext"

// CommonJS package: Node ESM yields `module.exports` (module on `.default`),
// bundlers yield the module itself. Unwrap for both.
const ProductModule =
  (ProductModuleExports as { default?: typeof ProductModuleExports }).default ??
  ProductModuleExports

export default defineLink(
  ProductModule.linkable.product,
  ProductExtModule.linkable.productExtension
)
