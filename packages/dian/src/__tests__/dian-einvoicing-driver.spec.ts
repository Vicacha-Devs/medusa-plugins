import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { DianFiscalDriver } from "../modules/dian/drivers/dian-fiscal-driver.js"
import { assertEinvoicingInstalled } from "../modules/dian/integrations/einvoicing-guard.js"
import { calculateColombianNitDv } from "../modules/dian/utils/index.js"

const EINVOICING_MODULE = "einvoicing"

describe("DIAN as a Driver for @vicacha-devs/medusa-plugin-einvoicing", () => {
  it("throws when @vicacha-devs/medusa-plugin-einvoicing is not registered", () => {
    assert.throws(
      () => assertEinvoicingInstalled({ resolve: () => null }),
      /requires @vicacha-devs\/medusa-plugin-einvoicing/
    )
  })

  it("succeeds when einvoicing module is registered in container", () => {
    const mockEinvoicing = { listFiscalDocuments: async () => [] }
    const resolved = assertEinvoicingInstalled({
      resolve: (key: string) =>
        key === EINVOICING_MODULE ? mockEinvoicing : null,
    })
    assert.equal(resolved, mockEinvoicing)
  })

  it("validates Colombian NIT check digits (DV) in DianFiscalDriver", () => {
    const driver = new DianFiscalDriver()
    const dv = calculateColombianNitDv("900123456")
    assert.equal(driver.validateTaxId(`900123456-${dv}`).valid, true)
    assert.equal(driver.validateTaxId("900123456-9").valid, false)
    assert.equal(driver.validateTaxId("123").valid, false)
  })

  it("delegates submitDocument to DianModuleService.submitFromEinvoicing when provided", async () => {
    const calls: any[] = []
    const driver = new DianFiscalDriver({
      async submitFromEinvoicing(ctx) {
        calls.push(ctx)
        return {
          success: true,
          status: "accepted",
          external_id: "cufe_sha384_mock",
        }
      },
    })

    const res = await driver.submitDocument({
      order_id: "ord_co_1",
      country_code: "CO",
      document_type: "invoice",
      document_number: "SETT-0001",
      currency_code: "COP",
      subtotal: 100000,
      tax_total: 19000,
      total: 119000,
      issuer_tax_id: "900123456",
      issuer_name: "Vicacha SAS",
    })

    assert.equal(calls.length, 1)
    assert.equal(res.success, true)
    assert.equal(res.external_id, "cufe_sha384_mock")
  })
})
