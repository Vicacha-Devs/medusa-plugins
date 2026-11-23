import { Module } from "@medusajs/framework/utils"
import AutomationsModuleService from "./service"

export const AUTOMATIONS_MODULE = "automations"

export default Module(AUTOMATIONS_MODULE, {
  service: AutomationsModuleService,
})
