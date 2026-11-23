import { model } from "@medusajs/framework/utils"

export const FiscalDocumentModel = model.define("fiscal_document", {
  id: model.id().primaryKey(),
  order_id: model.text().searchable(),
  country_code: model.text(),
  driver_id: model.text(),
  document_type: model
    .enum(["invoice", "credit_note", "debit_note", "pos_receipt"])
    .default("invoice"),
  document_number: model.text().searchable(),
  external_id: model.text().nullable(),
  status: model
    .enum(["draft", "submitted", "accepted", "rejected", "cancelled"])
    .default("draft"),
  buyer_tax_id: model.text().nullable(),
  is_b2b: model.boolean().default(false),
  company_id: model.text().nullable(),
  pdf_document_id: model.text().nullable(),
  payload_xml: model.text().nullable(),
  response_payload: model.json().nullable(),
  error_message: model.text().nullable(),
  issued_at: model.dateTime().nullable(),
})
