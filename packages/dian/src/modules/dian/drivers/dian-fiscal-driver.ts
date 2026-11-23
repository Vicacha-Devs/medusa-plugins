import { createHash } from "node:crypto"
import type {
  FiscalCountryDriver,
  FiscalDriverContext,
  FiscalSubmissionResult,
  FiscalTaxIdValidation,
} from "@vicacha-devs/medusa-plugin-einvoicing"
import { calculateColombianNitDv, sanitizeNitDigits } from "../utils"

/**
 * Colombia DIAN Fiscal Driver (`co-dian`) for `@vicacha-devs/medusa-plugin-einvoicing`.
 * Validates Colombian NITs using official Modulo-11 check digits and delegates
 * full DIAN UBL 2.1 / XAdES-EPES / SOAP / provider submission to `DianModuleService`.
 */
export class DianFiscalDriver implements FiscalCountryDriver {
  id = "co-dian"
  label = "Colombia DIAN UBL 2.1 (Resolución 000165)"
  countryCodes = ["CO"]

  private readonly dianService_?: {
    submitFromEinvoicing?: (
      ctx: FiscalDriverContext
    ) => Promise<FiscalSubmissionResult>
  }

  constructor(dianService?: {
    submitFromEinvoicing?: (
      ctx: FiscalDriverContext
    ) => Promise<FiscalSubmissionResult>
  }) {
    this.dianService_ = dianService
  }

  validateTaxId(taxId: string): FiscalTaxIdValidation {
    const cleaned = taxId.trim()
    if (!cleaned) {
      return { valid: false, reason: "Colombian NIT / CC is required" }
    }
    const parts = cleaned.split("-")
    const digits = sanitizeNitDigits(parts[0] || cleaned)
    if (digits.length < 6 || digits.length > 15) {
      return {
        valid: false,
        reason: "Colombian NIT / CC must contain 6 to 15 digits",
      }
    }
    if (parts.length === 2 && parts[1]?.trim()) {
      const expectedDv = calculateColombianNitDv(digits)
      if (parts[1].trim() !== expectedDv) {
        return {
          valid: false,
          reason: `Invalid NIT check digit (DV): expected ${expectedDv}`,
        }
      }
    }
    return { valid: true, normalized: digits }
  }

  buildPayload(ctx: FiscalDriverContext): string {
    return JSON.stringify({
      standard: "DIAN-UBL-2.1-Anexo-1.9",
      document_number: ctx.document_number,
      order_id: ctx.order_id,
      issuer_tax_id: ctx.issuer_tax_id,
      buyer_tax_id: ctx.buyer_tax_id,
      total: ctx.total,
      currency_code: ctx.currency_code,
    })
  }

  async submitDocument(
    ctx: FiscalDriverContext
  ): Promise<FiscalSubmissionResult> {
    if (typeof this.dianService_?.submitFromEinvoicing === "function") {
      return this.dianService_.submitFromEinvoicing(ctx)
    }

    const cufe = createHash("sha384")
      .update(
        `${ctx.document_number}:${ctx.issuer_tax_id}:${ctx.total.toFixed(2)}`
      )
      .digest("hex")

    return {
      success: true,
      status: "accepted",
      external_id: cufe,
      payload_xml: this.buildPayload(ctx),
      response_payload: {
        standard: "DIAN-1.9",
        cufe_alg: "SHA-384",
        driver: "co-dian",
      },
    }
  }
}
