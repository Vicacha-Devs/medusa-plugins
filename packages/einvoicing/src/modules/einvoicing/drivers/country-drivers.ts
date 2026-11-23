import { createHash } from "node:crypto"
import type {
  FiscalCountryDriver,
  FiscalDriverContext,
  FiscalSubmissionResult,
  FiscalTaxIdValidation,
} from "../../../types"

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function buildStandardUblXml(
  ctx: FiscalDriverContext,
  customizationId: string
): string {
  const rootTag = ctx.document_type === "credit_note" ? "CreditNote" : "Invoice"
  const num = escapeXml(ctx.document_number)
  const curr = escapeXml(ctx.currency_code.toUpperCase())
  const issuerName = escapeXml(ctx.issuer_name)
  const issuerTaxId = escapeXml(ctx.issuer_tax_id)
  const buyerName = escapeXml(ctx.buyer_name || "Customer")
  const buyerTaxId = escapeXml(ctx.buyer_tax_id || "CONSUMIDOR_FINAL")

  return `<?xml version="1.0" encoding="UTF-8"?>
<${rootTag} xmlns="urn:oasis:names:specification:ubl:schema:xsd:${rootTag}-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2">
  <cbc:CustomizationID>${escapeXml(customizationId)}</cbc:CustomizationID>
  <cbc:ID>${num}</cbc:ID>
  <cbc:DocumentCurrencyCode>${curr}</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${issuerName}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme><cbc:CompanyID>${issuerTaxId}</cbc:CompanyID></cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${buyerName}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme><cbc:CompanyID>${buyerTaxId}</cbc:CompanyID></cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="${curr}">${ctx.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${curr}">${ctx.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${curr}">${ctx.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</${rootTag}>`
}

export class EuPeppolDriver implements FiscalCountryDriver {
  id = "eu-peppol"
  label = "EU Peppol BIS 3.0 (EN 16931)"
  countryCodes = ["DE", "NL", "BE", "FR", "ES", "IT", "PL", "PT", "AT", "SE"]

  validateTaxId(taxId: string): FiscalTaxIdValidation {
    const normalized = taxId.replace(/[\s.-]+/g, "").toUpperCase()
    if (!/^[A-Z]{2}(?=.*\d)[A-Z0-9]{2,12}$/.test(normalized)) {
      return {
        valid: false,
        reason:
          "EU VAT ID must start with a 2-letter country code followed by 2-12 alphanumeric characters including digits",
      }
    }
    return { valid: true, normalized }
  }

  buildPayload(ctx: FiscalDriverContext): string {
    return buildStandardUblXml(
      ctx,
      "urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0"
    )
  }

  async submitDocument(
    ctx: FiscalDriverContext
  ): Promise<FiscalSubmissionResult> {
    const payload_xml = this.buildPayload(ctx)
    const external_id = `peppol_${createHash("sha256")
      .update(`${ctx.document_number}:${ctx.order_id}`)
      .digest("hex")
      .slice(0, 24)}`
    return {
      success: true,
      status: "accepted",
      external_id,
      payload_xml,
      response_payload: { standard: "EN16931", profile: "peppol-bis-3.0" },
    }
  }
}

export class ColombiaDianDriver implements FiscalCountryDriver {
  id = "co-dian"
  label = "Colombia DIAN UBL 2.1 (Resolución 000165)"
  countryCodes = ["CO"]

  validateTaxId(taxId: string): FiscalTaxIdValidation {
    const normalized = taxId.replace(/[\s.-]+/g, "")
    if (!/^\d{6,15}$/.test(normalized)) {
      return {
        valid: false,
        reason: "Colombian NIT / CC must contain 6 to 15 digits",
      }
    }
    return { valid: true, normalized }
  }

  buildPayload(ctx: FiscalDriverContext): string {
    return buildStandardUblXml(ctx, "DIAN-UBL-2.1-Anexo-1.9")
  }

  async submitDocument(
    ctx: FiscalDriverContext
  ): Promise<FiscalSubmissionResult> {
    const payload_xml = this.buildPayload(ctx)
    const external_id = createHash("sha384")
      .update(
        `${ctx.document_number}:${ctx.issuer_tax_id}:${ctx.total.toFixed(2)}`
      )
      .digest("hex")
    return {
      success: true,
      status: "accepted",
      external_id,
      payload_xml,
      response_payload: { standard: "DIAN-1.9", cufe_alg: "SHA-384" },
    }
  }
}

export class MexicoCfdiDriver implements FiscalCountryDriver {
  id = "mx-cfdi"
  label = "Mexico SAT CFDI 4.0"
  countryCodes = ["MX"]

  validateTaxId(taxId: string): FiscalTaxIdValidation {
    const normalized = taxId.replace(/[\s-]+/g, "").toUpperCase()
    if (!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(normalized)) {
      return {
        valid: false,
        reason:
          "Mexican RFC must match 3-4 letters, 6 birth/incorporation digits, and 3 homoclave chars",
      }
    }
    return { valid: true, normalized }
  }

  buildPayload(ctx: FiscalDriverContext): string {
    return buildStandardUblXml(ctx, "SAT-CFDI-4.0")
  }

  async submitDocument(
    ctx: FiscalDriverContext
  ): Promise<FiscalSubmissionResult> {
    const payload_xml = this.buildPayload(ctx)
    const external_id = `cfdi_${createHash("sha256")
      .update(`${ctx.document_number}:${ctx.order_id}`)
      .digest("hex")
      .slice(0, 32)}`
    return {
      success: true,
      status: "accepted",
      external_id,
      payload_xml,
      response_payload: { standard: "CFDI-4.0" },
    }
  }
}

export class GenericFiscalWebhookDriver implements FiscalCountryDriver {
  id = "generic-webhook"
  label = "Generic Fiscal Webhook (UBL 2.1 / JSON)"
  countryCodes = ["*"]

  validateTaxId(taxId: string): FiscalTaxIdValidation {
    const normalized = taxId.trim()
    if (normalized.length < 3) {
      return { valid: false, reason: "Tax ID must be at least 3 characters" }
    }
    return { valid: true, normalized }
  }

  buildPayload(ctx: FiscalDriverContext): string {
    return buildStandardUblXml(ctx, "UBL-2.1-GENERIC")
  }

  async submitDocument(
    ctx: FiscalDriverContext
  ): Promise<FiscalSubmissionResult> {
    const payload_xml = this.buildPayload(ctx)
    const webhookUrl = String(ctx.settings?.webhook_url || "").trim()
    if (webhookUrl) {
      let parsed: URL
      try {
        parsed = new URL(webhookUrl)
      } catch {
        return {
          success: false,
          status: "rejected",
          payload_xml,
          error_message: "Invalid fiscal webhook URL",
        }
      }
      const isHttps = parsed.protocol === "https:"
      const isDevLoopback =
        parsed.protocol === "http:" &&
        process.env.NODE_ENV !== "production" &&
        (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost")
      if (!isHttps && !isDevLoopback) {
        return {
          success: false,
          status: "rejected",
          payload_xml,
          error_message: "Fiscal webhook URL must use https://",
        }
      }

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_number: ctx.document_number,
          country_code: ctx.country_code,
          document_type: ctx.document_type,
          order_id: ctx.order_id,
          total: ctx.total,
          currency_code: ctx.currency_code,
          payload_xml,
        }),
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) {
        return {
          success: false,
          status: "rejected",
          payload_xml,
          error_message: `Fiscal webhook returned HTTP ${res.status}`,
        }
      }
    }

    return {
      success: true,
      status: "accepted",
      external_id: `fiscal_${Date.now()}`,
      payload_xml,
      response_payload: { standard: "UBL-2.1-GENERIC" },
    }
  }
}

export function createBuiltInFiscalDrivers(): FiscalCountryDriver[] {
  return [
    new EuPeppolDriver(),
    new ColombiaDianDriver(),
    new MexicoCfdiDriver(),
    new GenericFiscalWebhookDriver(),
  ]
}
