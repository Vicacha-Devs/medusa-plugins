import {
  AbstractPaymentProvider,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"

export type MolliePluginOptions = {
  apiKey?: string
  webhookUrl?: string
  baseUrl?: string
}

const MOLLIE_PAYMENT_ID_PATTERN = /^tr_[A-Za-z0-9]{6,40}$/

function resolveSafeBaseUrl(override?: string): string {
  if (!override) return "https://api.mollie.com"
  const parsed = new URL(override)
  const isLoopback =
    parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost"
  if (parsed.protocol === "https:" || (process.env.NODE_ENV !== "production" && isLoopback)) {
    return parsed.origin
  }
  throw new Error("Unsafe Mollie baseUrl override rejected")
}

export class MolliePaymentProviderService extends AbstractPaymentProvider<MolliePluginOptions> {
  static identifier = "mollie-ideal"
  protected options_: MolliePluginOptions

  constructor(container: Record<string, unknown>, options: MolliePluginOptions) {
    super(container, options)
    this.options_ = options
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const apiKey = this.options_.apiKey || process.env.MOLLIE_API_KEY
    if (!apiKey) {
      throw new Error("MOLLIE_API_KEY is required to initiate Mollie payments")
    }

    const sessionId = `tr_mollie_${Date.now()}`
    return {
      id: sessionId,
      data: {
        id: sessionId,
        provider: "mollie",
        methods: ["ideal", "bancontact", "creditcard", "applepay", "banktransfer"],
        amount: input.amount,
        currency_code: input.currency_code,
        checkout_url: `https://www.mollie.com/checkout/select-method/${sessionId}`,
      },
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    return {
      status: PaymentSessionStatus.AUTHORIZED,
      data: input.data ?? {},
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    return { data: { ...(input.data ?? {}), captured: true } }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return { data: { ...(input.data ?? {}), refunded_amount: input.amount } }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: { ...(input.data ?? {}), cancelled: true } }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async getPaymentStatus(
    _input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    return { status: PaymentSessionStatus.AUTHORIZED }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return {
      data: {
        ...(input.data ?? {}),
        amount: input.amount,
        currency_code: input.currency_code,
      },
    }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const rawId = String((payload.data as { id?: string } | undefined)?.id ?? "")
    if (!MOLLIE_PAYMENT_ID_PATTERN.test(rawId)) {
      return { action: "not_supported" }
    }

    const apiKey = this.options_.apiKey || process.env.MOLLIE_API_KEY
    if (!apiKey) {
      throw new Error("MOLLIE_API_KEY is required to verify Mollie webhooks")
    }

    const baseUrl = resolveSafeBaseUrl(this.options_.baseUrl)
    const response = await fetch(`${baseUrl}/v2/payments/${rawId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      return { action: "failed" }
    }

    const payment = (await response.json()) as {
      id: string
      status: string
      amount?: { value?: string }
    }

    const amount = Number(payment.amount?.value ?? 0)
    if (payment.status === "paid") {
      return { action: "captured", data: { session_id: payment.id, amount } }
    }
    if (payment.status === "authorized") {
      return { action: "authorized", data: { session_id: payment.id, amount } }
    }
    if (
      payment.status === "failed" ||
      payment.status === "canceled" ||
      payment.status === "expired"
    ) {
      return { action: "failed", data: { session_id: payment.id, amount } }
    }
    return { action: "not_supported" }
  }
}

export class B2BInvoiceProviderService extends AbstractPaymentProvider {
  static identifier = "b2b-invoice"

  constructor(container: Record<string, unknown>, options: Record<string, unknown>) {
    super(container, options)
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const invoiceRef = `VIC-NL-${Date.now()}`
    return {
      id: invoiceRef,
      data: {
        invoice_reference: invoiceRef,
        payment_terms_days: 14,
        sepa_iban_note: "SEPA Bank Transfer — Rotterdam B.V.",
        amount: input.amount,
        currency_code: input.currency_code,
      },
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    return { status: PaymentSessionStatus.AUTHORIZED, data: input.data ?? {} }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return { data: { ...(input.data ?? {}), settled: true } }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return { data: input.data ?? {} }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: input.data ?? {} }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async getPaymentStatus(): Promise<GetPaymentStatusOutput> {
    return { status: PaymentSessionStatus.AUTHORIZED }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async getWebhookActionAndData(): Promise<WebhookActionResult> {
    return { action: "not_supported" }
  }
}
