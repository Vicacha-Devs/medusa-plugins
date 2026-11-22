import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import type {
  CalculatedShippingOptionPrice,
  CreateFulfillmentResult,
  FulfillmentOption,
} from "@medusajs/framework/types"

export interface EuFulfillmentOptions {
  beneluxFreeThresholdEur?: number
  euFreeThresholdEur?: number
  freeWeightGrams?: number
  palletWeightGrams?: number
  beneluxPalletEur?: number
  euPalletEur?: number
  letterboxRateEur?: number
  letterboxMaxGrams?: number
  beneluxParcelRateEur?: number
  euParcelRateEur?: number
  defaultItemWeightGrams?: number
  carrier?: string
  dispatchedFrom?: string
}

export interface ShippingQuoteInput {
  countryCode: string
  subtotalEur: number
  totalWeightGrams: number
  isGreenBulk: boolean
}

export interface ShippingQuoteResult {
  optionId: "postnl-letterbox" | "sendcloud-eu-parcel" | "rotterdam-lcl-pallet"
  priceEur: number
  freeShippingApplied: boolean
  amountRemainingForFreeEur: number
  freeThresholdEur: number
}

const BENELUX = new Set(["NL", "BE", "LU"])

/**
 * Pure EU & Benelux shipping rate calculator supporting PostNL letterbox,
 * Sendcloud EU parcel, free-shipping weight/value thresholds, and LCL pallet freight.
 */
export function calculateEuShippingQuote(
  input: ShippingQuoteInput,
  options: EuFulfillmentOptions = {}
): ShippingQuoteResult {
  const country = input.countryCode.toUpperCase()
  const isBenelux = BENELUX.has(country)

  const palletWeightGrams = options.palletWeightGrams ?? 24000
  if (input.isGreenBulk || input.totalWeightGrams >= palletWeightGrams) {
    const palletPrice = isBenelux
      ? (options.beneluxPalletEur ?? 45)
      : (options.euPalletEur ?? 85)
    return {
      optionId: "rotterdam-lcl-pallet",
      priceEur: palletPrice,
      freeShippingApplied: false,
      amountRemainingForFreeEur: 0,
      freeThresholdEur: 0,
    }
  }

  const freeThresholdEur = isBenelux
    ? (options.beneluxFreeThresholdEur ?? 25)
    : (options.euFreeThresholdEur ?? 50)
  const freeWeightGrams = options.freeWeightGrams ?? 1000
  const qualifiesByWeight = input.totalWeightGrams >= freeWeightGrams
  const qualifiesByValue = input.subtotalEur >= freeThresholdEur
  const freeShippingApplied = qualifiesByWeight || qualifiesByValue

  const letterboxMaxGrams = options.letterboxMaxGrams ?? 1500
  const optionId =
    isBenelux && input.totalWeightGrams <= letterboxMaxGrams
      ? "postnl-letterbox"
      : "sendcloud-eu-parcel"

  const baseRate =
    optionId === "postnl-letterbox"
      ? (options.letterboxRateEur ?? 4.25)
      : isBenelux
        ? (options.beneluxParcelRateEur ?? 5.95)
        : (options.euParcelRateEur ?? 8.95)

  return {
    optionId,
    priceEur: freeShippingApplied ? 0 : baseRate,
    freeShippingApplied,
    amountRemainingForFreeEur: freeShippingApplied
      ? 0
      : Number(Math.max(0, freeThresholdEur - input.subtotalEur).toFixed(2)),
    freeThresholdEur,
  }
}

export class EuFulfillmentProviderService extends AbstractFulfillmentProviderService {
  static identifier = "eu-fulfillment"

  protected readonly options_: EuFulfillmentOptions

  constructor(_container: Record<string, unknown>, options: EuFulfillmentOptions = {}) {
    super()
    this.options_ = options
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [
      { id: "postnl-letterbox" },
      { id: "sendcloud-eu-parcel" },
      { id: "rotterdam-lcl-pallet" },
    ]
  }

  async validateFulfillmentData(
    _optionData: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return data
  }

  async validateOption(_data: Record<string, unknown>): Promise<boolean> {
    return true
  }

  async canCalculate(): Promise<boolean> {
    return true
  }

  async calculatePrice(
    optionData: Record<string, unknown>,
    _data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<CalculatedShippingOptionPrice> {
    const countryCode = String(
      (context.shipping_address as { country_code?: string } | undefined)
        ?.country_code ?? "NL"
    )
    const items =
      (context.items as
        | Array<{
            quantity?: number
            variant?: { weight?: number }
            unit_price?: number
          }>
        | undefined) ?? []

    const defaultWeight = this.options_.defaultItemWeightGrams ?? 250
    let totalWeightGrams = 0
    let subtotalEur = 0
    for (const item of items) {
      const qty = Number(item.quantity ?? 1)
      const weight = Number(item.variant?.weight ?? defaultWeight)
      totalWeightGrams += weight * qty
      subtotalEur += Number(item.unit_price ?? 0) * qty
    }

    const quote = calculateEuShippingQuote(
      {
        countryCode,
        subtotalEur,
        totalWeightGrams,
        isGreenBulk: optionData.id === "rotterdam-lcl-pallet",
      },
      this.options_
    )

    return {
      calculated_amount: quote.priceEur,
      is_calculated_price_tax_inclusive: true,
    }
  }

  async createFulfillment(): Promise<CreateFulfillmentResult> {
    return {
      data: {
        carrier: this.options_.carrier ?? "sendcloud-postnl",
        dispatched_from: this.options_.dispatchedFrom ?? "Rotterdam Hub",
      },
      labels: [],
    }
  }

  async cancelFulfillment(): Promise<Record<string, unknown>> {
    return {}
  }

  async createReturnFulfillment(): Promise<CreateFulfillmentResult> {
    return { data: {}, labels: [] }
  }
}
