import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import {
  TypesenseSearchProviderService,
  TYPESENSE_PROVIDER_IDENTIFIER,
} from "./service"
import type { TypesenseSearchProviderOptions } from "../../types"

export {
  TypesenseSearchProviderService,
  TYPESENSE_PROVIDER_IDENTIFIER,
  type TypesenseSearchProviderOptions,
}

export default ModuleProvider(Modules.SEARCH, {
  services: [TypesenseSearchProviderService],
})
