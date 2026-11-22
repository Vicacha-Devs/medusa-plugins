import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  calculateEuShippingQuote,
  EuFulfillmentProviderService,
} from "../providers/eu-fulfillment/service.ts"

describe("calculateEuShippingQuote", () => {
  it("applies free PostNL letterbox shipping in Benelux at €25+", () => {
    const quote = calculateEuShippingQuote({
      countryCode: "NL",
      subtotalEur: 27,
      totalWeightGrams: 500,
      isGreenBulk: false,
    })
    assert.equal(quote.freeShippingApplied, true)
    assert.equal(quote.optionId, "postnl-letterbox")
    assert.equal(quote.priceEur, 0)
  })

  it("charges EU parcel rate under €50 and <1kg, and unlocks free shipping at 1kg+", () => {
    const under = calculateEuShippingQuote({
      countryCode: "DE",
      subtotalEur: 35,
      totalWeightGrams: 500,
      isGreenBulk: false,
    })
    assert.equal(under.freeShippingApplied, false)
    assert.equal(under.amountRemainingForFreeEur, 15)
    assert.equal(under.optionId, "sendcloud-eu-parcel")
    assert.equal(under.priceEur, 8.95)

    const oneKg = calculateEuShippingQuote({
      countryCode: "DE",
      subtotalEur: 34,
      totalWeightGrams: 1000,
      isGreenBulk: false,
    })
    assert.equal(oneKg.freeShippingApplied, true)
    assert.equal(oneKg.priceEur, 0)
  })

  it("calculates Rotterdam LCL pallet freight for green bulk orders", () => {
    const nlPallet = calculateEuShippingQuote({
      countryCode: "NL",
      subtotalEur: 686,
      totalWeightGrams: 70000,
      isGreenBulk: true,
    })
    assert.equal(nlPallet.optionId, "rotterdam-lcl-pallet")
    assert.equal(nlPallet.priceEur, 45)

    const dePallet = calculateEuShippingQuote({
      countryCode: "DE",
      subtotalEur: 686,
      totalWeightGrams: 70000,
      isGreenBulk: false,
    })
    assert.equal(dePallet.optionId, "rotterdam-lcl-pallet")
    assert.equal(dePallet.priceEur, 85)
  })

  it("supports EuFulfillmentProviderService methods", async () => {
    const svc = new EuFulfillmentProviderService({}, { dispatchedFrom: "Rotterdam Port" })
    const opts = await svc.getFulfillmentOptions()
    assert.equal(opts.length, 3)

    const price = await svc.calculatePrice(
      { id: "postnl-letterbox" },
      {},
      {
        shipping_address: { country_code: "NL" },
        items: [{ quantity: 1, variant: { weight: 250 }, unit_price: 13.5 }],
      }
    )
    assert.equal(price.calculated_amount, 4.25)

    const fulfillment = await svc.createFulfillment()
    assert.equal(fulfillment.data.dispatched_from, "Rotterdam Port")
  })
})
