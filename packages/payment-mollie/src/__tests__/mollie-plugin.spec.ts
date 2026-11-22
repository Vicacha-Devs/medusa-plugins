import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { MolliePaymentProviderService } from "../providers/mollie-payment/service.ts"

describe("@vicacha-devs/medusa-payment-mollie plugin", () => {
  it("rejects malformed payment IDs in webhook to prevent path/SSRF injection", async () => {
    const svc = new MolliePaymentProviderService({}, { apiKey: "test_123" })
    const res = await svc.getWebhookActionAndData({
      data: { id: "../../admin/users" },
      rawData: "",
      headers: {},
    })
    assert.equal(res.action, "not_supported")
  })

  it("rejects non-https non-loopback baseUrl overrides", async () => {
    const svc = new MolliePaymentProviderService(
      {},
      { apiKey: "test_123", baseUrl: "http://169.254.169.254" }
    )
    await assert.rejects(
      () =>
        svc.getWebhookActionAndData({
          data: { id: "tr_WDqYK6vllg" },
          rawData: "",
          headers: {},
        }),
      /Unsafe Mollie baseUrl override rejected/
    )
  })
})
