import { MedusaService } from "@medusajs/framework/utils"
import type {
  FiscalCountryDriver,
  FiscalDriverContext,
  IssueFiscalDocumentInput,
} from "../../types"
import { createBuiltInFiscalDrivers } from "./drivers/country-drivers"
import {
  resolveOptionalB2BCompany,
  resolveOptionalDianService,
  resolveOptionalDocumentsPdfId,
} from "./integrations/optional-bridges"
import { FiscalConfigModel } from "./models/fiscal-config"
import { FiscalDocumentModel } from "./models/fiscal-document"

export class EinvoicingModuleService extends MedusaService({
  FiscalDocument: FiscalDocumentModel,
  FiscalConfig: FiscalConfigModel,
}) {
  private readonly drivers_ = new Map<string, FiscalCountryDriver>()

  constructor(
    container: Record<string, unknown>,
    options?: { drivers?: FiscalCountryDriver[] }
  ) {
    super(container, options)
    for (const d of createBuiltInFiscalDrivers()) {
      this.drivers_.set(d.id, d)
    }
    for (const custom of options?.drivers ?? []) {
      this.drivers_.set(custom.id, custom)
    }
  }

  async registerDriver(driver: FiscalCountryDriver): void {
    this.drivers_.set(driver.id, driver)
  }

  async listDrivers(): Array<{
    id: string
    label: string
    countryCodes: string[]
  }> {
    return [...this.drivers_.values()].map((d) => ({
      id: d.id,
      label: d.label,
      countryCodes: d.countryCodes,
    }))
  }

  async resolveDriverForCountry(
    countryCode: string,
    preferredDriverId?: string
  ): FiscalCountryDriver {
    if (preferredDriverId && this.drivers_.has(preferredDriverId)) {
      return this.drivers_.get(preferredDriverId)!
    }
    const upper = countryCode.toUpperCase()
    for (const driver of this.drivers_.values()) {
      if (driver.countryCodes.includes(upper)) {
        return driver
      }
    }
    return this.drivers_.get("generic-webhook")!
  }

  async issueDocument(
    input: IssueFiscalDocumentInput,
    container?: { resolve?: (key: string) => any }
  ) {
    const countryCode = input.country_code.toUpperCase()
    const configs = await this.listFiscalConfigs({
      country_code: countryCode,
      is_active: true,
    })
    const cfg = configs?.[0]
    const driver = this.resolveDriverForCountry(
      countryCode,
      input.driver_id || cfg?.driver_id
    )

    const b2bInfo = await resolveOptionalB2BCompany(container, input.company_id)
    const buyerTaxId = b2bInfo?.tax_id || input.buyer_tax_id || null
    if (buyerTaxId) {
      const check = driver.validateTaxId(buyerTaxId)
      if (!check.valid) {
        throw new Error(
          `Invalid buyer tax ID for ${countryCode} (${driver.id}): ${check.reason}`
        )
      }
    }

    const prefix = cfg?.prefix || "INV"
    const seq = Number(cfg?.next_number || 1)
    const document_number = `${prefix}-${countryCode}-${String(seq).padStart(6, "0")}`

    const ctx: FiscalDriverContext = {
      order_id: input.order_id,
      country_code: countryCode,
      document_type: input.document_type || "invoice",
      document_number,
      currency_code: (input.currency_code || "USD").toUpperCase(),
      subtotal: Number(input.subtotal ?? 0),
      tax_total: Number(input.tax_total ?? 0),
      total: Number(input.total ?? 0),
      issuer_tax_id: cfg?.issuer_tax_id || "ISSUER_TAX_ID",
      issuer_name: cfg?.issuer_name || "Medusa Store",
      buyer_tax_id: buyerTaxId,
      buyer_name: b2bInfo?.legal_name || input.buyer_name || null,
      buyer_email: b2bInfo?.email || input.buyer_email || null,
      is_b2b: Boolean(b2bInfo?.is_b2b || input.company_id),
      company_id: b2bInfo?.company_id || input.company_id || null,
      items: input.items,
      settings: (cfg?.settings as Record<string, unknown> | null) ?? null,
    }

    const dianService =
      driver.id === "co-dian" ? resolveOptionalDianService(container) : null
    const result =
      dianService && typeof dianService.submitFromEinvoicing === "function"
        ? await dianService.submitFromEinvoicing(ctx)
        : await driver.submitDocument(ctx)
    const pdfDocumentId = await resolveOptionalDocumentsPdfId(
      container,
      input.order_id
    )

    const created = await this.createFiscalDocuments({
      order_id: input.order_id,
      country_code: countryCode,
      driver_id: driver.id,
      document_type: ctx.document_type,
      document_number,
      external_id: result.external_id ?? null,
      status: result.status,
      buyer_tax_id: buyerTaxId,
      is_b2b: ctx.is_b2b,
      company_id: ctx.company_id,
      pdf_document_id: pdfDocumentId,
      payload_xml: result.payload_xml ?? null,
      response_payload: result.response_payload ?? null,
      error_message: result.error_message ?? null,
      issued_at: result.success ? new Date() : null,
    })

    if (cfg?.id) {
      await this.updateFiscalConfigs({
        id: cfg.id,
        next_number: seq + 1,
      })
    }

    return created
  }
}

export default EinvoicingModuleService
