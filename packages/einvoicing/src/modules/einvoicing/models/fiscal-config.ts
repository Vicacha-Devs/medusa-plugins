import { model } from "@medusajs/framework/utils"

export const FiscalConfigModel = model.define("fiscal_config", {
  id: model.id().primaryKey(),
  country_code: model.text(),
  driver_id: model.text(),
  is_active: model.boolean().default(true),
  environment: model.enum(["sandbox", "production"]).default("sandbox"),
  issuer_tax_id: model.text(),
  issuer_name: model.text(),
  prefix: model.text().default("INV"),
  next_number: model.number().default(1),
  settings: model.json().nullable(),
})
