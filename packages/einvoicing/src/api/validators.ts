import { z } from "@medusajs/framework/zod"

export const issueFiscalDocumentSchema = z.object({
  order_id: z.string().min(1),
  country_code: z.string().min(2).max(2),
  driver_id: z.string().optional(),
  document_type: z
    .enum(["invoice", "credit_note", "debit_note", "pos_receipt"])
    .optional(),
  currency_code: z.string().min(3).max(3).optional(),
  subtotal: z.number().nonnegative().optional(),
  tax_total: z.number().nonnegative().optional(),
  total: z.number().nonnegative().optional(),
  buyer_tax_id: z.string().nullable().optional(),
  buyer_name: z.string().nullable().optional(),
  buyer_email: z.string().email().nullable().optional(),
  company_id: z.string().nullable().optional(),
})

export const upsertFiscalConfigSchema = z.object({
  country_code: z.string().min(2).max(2),
  driver_id: z.string().min(1),
  is_active: z.boolean().optional(),
  environment: z.enum(["sandbox", "production"]).optional(),
  issuer_tax_id: z.string().min(1),
  issuer_name: z.string().min(1),
  prefix: z.string().min(1).optional(),
  next_number: z.number().int().positive().optional(),
  settings: z.record(z.string(), z.unknown()).nullable().optional(),
})
