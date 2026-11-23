export type FiscalDocumentType =
  | "invoice"
  | "credit_note"
  | "debit_note"
  | "pos_receipt"

export type FiscalDocumentStatus =
  | "draft"
  | "submitted"
  | "accepted"
  | "rejected"
  | "cancelled"

export interface FiscalTaxIdValidation {
  valid: boolean
  normalized?: string
  reason?: string
}

export interface FiscalDriverContext {
  order_id: string
  country_code: string
  document_type: FiscalDocumentType
  document_number: string
  currency_code: string
  subtotal: number
  tax_total: number
  total: number
  issuer_tax_id: string
  issuer_name: string
  buyer_tax_id?: string | null
  buyer_name?: string | null
  buyer_email?: string | null
  is_b2b?: boolean
  company_id?: string | null
  items?: Array<{
    title: string
    quantity: number
    unit_price: number
    tax_rate?: number
  }>
  settings?: Record<string, unknown> | null
}

export interface FiscalSubmissionResult {
  success: boolean
  status: FiscalDocumentStatus
  external_id?: string
  payload_xml?: string
  response_payload?: Record<string, unknown>
  error_message?: string
}

export interface FiscalCountryDriver {
  id: string
  label: string
  countryCodes: string[]
  validateTaxId: (taxId: string) => FiscalTaxIdValidation
  buildPayload: (ctx: FiscalDriverContext) => string
  submitDocument: (ctx: FiscalDriverContext) => Promise<FiscalSubmissionResult>
}

export interface IssueFiscalDocumentInput {
  order_id: string
  country_code: string
  driver_id?: string
  document_type?: FiscalDocumentType
  currency_code?: string
  subtotal?: number
  tax_total?: number
  total?: number
  buyer_tax_id?: string | null
  buyer_name?: string | null
  buyer_email?: string | null
  company_id?: string | null
  items?: FiscalDriverContext["items"]
}

export interface CreateEinvoicingInput {
  label: string
  active?: boolean
}
