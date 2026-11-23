import { Module } from "@medusajs/framework/utils"
import EinvoicingModuleService from "./service"

export const EINVOICING_MODULE = "einvoicing"

export default Module(EINVOICING_MODULE, {
  service: EinvoicingModuleService,
})
