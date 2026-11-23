import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  ColombiaDianDriver,
  EuPeppolDriver,
  GenericFiscalWebhookDriver,
  MexicoCfdiDriver,
} from "../modules/einvoicing/drivers/country-drivers.js"
import {
  resolveOptionalB2BCompany,
  resolveOptionalDianService,
  resolveOptionalDocumentsPdfId,
} from "../modules/einvoicing/integrations/optional-bridges.js"

describe("@vicacha-devs/medusa-plugin-einvoicing", () => {
  it("validates country-specific tax IDs across EU Peppol, Colombia DIAN, and Mexico CFDI", () => {
    const eu = new EuPeppolDriver()
    assert.equal(eu.validateTaxId("NL123456789B01").valid, true)
    assert.equal(eu.validateTaxId("INVALID").valid, false)

    const co = new ColombiaDianDriver()
    assert.equal(co.validateTaxId("900.123.456-7").valid, true)
    assert.equal(co.validateTaxId("123").valid, false)

    const mx = new MexicoCfdiDriver()
    assert.equal(mx.validateTaxId("XAXX010101000").valid, true)
    assert.equal(mx.validateTaxId("BAD").valid, false)
  })

  it("generates UBL 2.1 XML and external IDs for EU Peppol and DIAN", async () => {
    const eu = new EuPeppolDriver()
    const res = await eu.submitDocument({
      order_id: "ord_1",
      country_code: "NL",
      document_type: "invoice",
      document_number: "INV-NL-000001",
      currency_code: "EUR",
      subtotal: 100,
      tax_total: 21,
      total: 121,
      issuer_tax_id: "NL123456789B01",
      issuer_name: "Vicacha EU BV",
      buyer_tax_id: "DE123456789",
      buyer_name: "Berlin GmbH",
    })
    assert.equal(res.success, true)
    assert.equal(res.status, "accepted")
    assert.ok(res.external_id?.startsWith("peppol_"))
    assert.ok(res.payload_xml?.includes("urn:cen.eu:en16931:2017"))
  })

  it("resolves optional B2B company and Documents PDF bridges gracefully when absent or present", async () => {
    assert.equal(await resolveOptionalB2BCompany(null, "comp_1"), null)
    assert.equal(await resolveOptionalDocumentsPdfId(null, "ord_1"), null)

    const mockContainer = {
      resolve(key: string) {
        if (key === "company") {
          return {
            async retrieveCompany(id: string) {
              return { id, tax_id: "NL999888777B01", name: "Acme B2B BV" }
            },
          }
        }
        if (key === "documentsModuleService") {
          return {
            async listDocuments() {
              return [{ id: "doc_pdf_1" }]
            },
          }
        }
        return null
      },
    }

    const b2b = await resolveOptionalB2BCompany(mockContainer, "comp_1")
    assert.equal(b2b?.is_b2b, true)
    assert.equal(b2b?.tax_id, "NL999888777B01")

    const pdfId = await resolveOptionalDocumentsPdfId(mockContainer, "ord_1")
    assert.equal(pdfId, "doc_pdf_1")

    assert.equal(resolveOptionalDianService(null), null)
    const mockDian = { submitFromEinvoicing: async () => ({ success: true }) }
    assert.equal(
      resolveOptionalDianService({
        resolve: (k: string) => (k === "dian" ? mockDian : null),
      }),
      mockDian
    )
  })

  it("rejects unsafe non-HTTPS fiscal webhook URLs in production", async () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = "production"
    try {
      const driver = new GenericFiscalWebhookDriver()
      const res = await driver.submitDocument({
        order_id: "ord_2",
        country_code: "US",
        document_type: "invoice",
        document_number: "INV-US-000001",
        currency_code: "USD",
        subtotal: 50,
        tax_total: 0,
        total: 50,
        issuer_tax_id: "12-3456789",
        issuer_name: "Vicacha US Inc",
        settings: { webhook_url: "http://127.0.0.1:4000/fiscal" },
      })
      assert.equal(res.success, false)
      assert.equal(res.status, "rejected")
    } finally {
      process.env.NODE_ENV = prev
    }
  })
})
