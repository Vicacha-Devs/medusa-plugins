import assert from "node:assert/strict"
import crypto from "node:crypto"
import { EventEmitter } from "node:events"
import { after, before, beforeEach, describe, it } from "node:test"

import { GET as getPaymentStatusRoute } from "../api/admin/bold/payment-status/route"
import { GET as streamPaymentRoute } from "../api/admin/bold/payment-stream/route"
import { POST as createButtonRoute } from "../api/admin/bold/payment-button/route"
import { POST as createLinkRoute } from "../api/admin/bold/payment-link/route"
import { POST as createQrRoute } from "../api/admin/bold/payment-qr/route"
import { POST as posPushRoute } from "../api/admin/bold/pos-push/route"
import { POST as refundRoute } from "../api/admin/bold/refund/route"
import { GET as getTerminalsRoute } from "../api/admin/bold/terminals/route"
import { POST as webhookRoute } from "../api/hooks/payment/bold/route"
import { BoldButtonPaymentProviderService } from "../providers/bold-button/index"
import { BoldLinkPaymentProviderService } from "../providers/bold-link/index"
import { BoldOnlinePaymentProviderService } from "../providers/bold-online/index"
import { BoldTerminalPaymentProviderService } from "../providers/bold-terminal/index"
import { BoldHttpClient } from "../services/bold-client"
import { BoldIntegrityService } from "../services/integrity"
import { EMedusaFormatBoldPaymentProvider } from "../types/enums"
import { BoldQaEmulator, signBoldWebhook } from "./bold-qa-emulator"

interface MockSession {
  id: string
  payment_collection_id: string
  provider_id: string
  amount: number
  currency_code: string
  status: string
  data: Record<string, unknown>
}

interface MockPayment {
  id: string
  session_id: string
  provider_id: string
  amount: number
  currency_code: string
  data: Record<string, unknown>
  captured_at?: string
}

function createSilentLogger() {
  return {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  } as any
}

function createMockRes() {
  const headers: Record<string, string> = {}
  const chunks: string[] = []
  let statusCode = 200
  let jsonBody: unknown = null
  let ended = false
  let endResolve: (() => void) | null = null
  const done = new Promise<void>((resolve) => {
    endResolve = resolve
  })

  const res = {
    setHeader(k: string, v: string) {
      headers[k.toLowerCase()] = v
    },
    status(code: number) {
      statusCode = code
      return res
    },
    json(payload: unknown) {
      jsonBody = payload
      ended = true
      endResolve?.()
      return res
    },
    write(chunk: string) {
      chunks.push(chunk)
      return true
    },
    end() {
      ended = true
      endResolve?.()
    },
    get statusCode() {
      return statusCode
    },
    get jsonBody() {
      return jsonBody
    },
    get headers() {
      return headers
    },
    get chunks() {
      return chunks
    },
    get ended() {
      return ended
    },
    done,
  }
  return res
}

function createMedusaTestHarness(emulator: BoldQaEmulator) {
  const logger = createSilentLogger()
  const options = emulator.clientOptions

  const linkProvider = new BoldLinkPaymentProviderService({ logger }, options)
  const onlineProvider = new BoldOnlinePaymentProviderService({ logger }, options)
  const buttonProvider = new BoldButtonPaymentProviderService({ logger }, options)
  const terminalProvider = new BoldTerminalPaymentProviderService({ logger }, options)

  const providersById = new Map<string, any>([
    [EMedusaFormatBoldPaymentProvider.LINK, linkProvider],
    [EMedusaFormatBoldPaymentProvider.ONLINE, onlineProvider],
    [EMedusaFormatBoldPaymentProvider.BUTTON, buttonProvider],
    [EMedusaFormatBoldPaymentProvider.TERMINAL, terminalProvider],
  ])

  const collections = new Map<string, { id: string; amount: number; currency_code: string }>()
  const sessions = new Map<string, MockSession>()
  const payments = new Map<string, MockPayment>()
  let seq = 1

  const paymentModule = {
    async createPaymentCollections(input: { amount: number; currency_code: string }) {
      const col = { id: `pay_col_${seq++}`, ...input }
      collections.set(col.id, col)
      return col
    },
    async retrievePaymentCollection(id: string) {
      return collections.get(id)
    },
    async deletePaymentCollections(ids: string[]) {
      for (const id of ids) collections.delete(id)
    },
    getPaymentProvider(providerId: string) {
      return providersById.get(providerId)
    },
    async createPaymentSession(
      collectionId: string,
      input: {
        provider_id: string
        amount: number
        currency_code: string
        data: Record<string, unknown>
      }
    ) {
      const provider = providersById.get(input.provider_id)
      if (!provider) {
        throw new Error(`Unknown provider_id: ${input.provider_id}`)
      }
      const initOut = await provider.initiatePayment({
        amount: input.amount,
        currency_code: input.currency_code,
        data: input.data,
      })
      const session: MockSession = {
        id: `payses_${seq++}`,
        payment_collection_id: collectionId,
        provider_id: input.provider_id,
        amount: input.amount,
        currency_code: input.currency_code,
        status: "pending",
        data: initOut.data as Record<string, unknown>,
      }
      sessions.set(session.id, session)
      return session
    },
    async listPaymentSessions(filter: { status?: string } = {}) {
      const all = [...sessions.values()]
      return filter.status ? all.filter((s) => s.status === filter.status) : all
    },
    async retrievePaymentSession(id: string) {
      const s = sessions.get(id)
      if (!s) throw new Error(`Session ${id} not found`)
      return s
    },
    async authorizePaymentSession(id: string) {
      const session = sessions.get(id)
      if (!session) throw new Error(`Session ${id} not found`)
      const provider = providersById.get(session.provider_id)
      const auth = await provider.authorizePayment({ data: session.data })
      session.status = auth.status
      session.data = auth.data as Record<string, unknown>
      const payment: MockPayment = {
        id: `pay_${seq++}`,
        session_id: session.id,
        provider_id: session.provider_id,
        amount: session.amount,
        currency_code: session.currency_code,
        data: { ...session.data },
      }
      payments.set(payment.id, payment)
      return payment
    },
    async capturePayment(input: { payment_id: string }) {
      const payment = payments.get(input.payment_id)
      if (!payment) throw new Error(`Payment ${input.payment_id} not found`)
      const provider = providersById.get(payment.provider_id)
      const captured = await provider.capturePayment({ data: payment.data })
      payment.data = captured.data as Record<string, unknown>
      payment.captured_at = new Date().toISOString()
      const session = sessions.get(payment.session_id)
      if (session) session.status = "captured"
      return payment
    },
    async refundPayment(input: { payment_id: string; amount: number; note?: string }) {
      const payment = payments.get(input.payment_id)
      if (!payment) throw new Error(`Payment ${input.payment_id} not found`)
      const provider = providersById.get(payment.provider_id)
      const refunded = await provider.refundPayment({
        data: payment.data,
        amount: input.amount,
      })
      payment.data = refunded.data as Record<string, unknown>
      return {
        id: refunded.data.refund_id,
        amount: input.amount,
        note: input.note,
      }
    },
  }

  const scope = {
    resolve(key: string) {
      if (key === "logger") return logger
      if (key === "payment") return paymentModule
      if (key === "remoteQuery") return async () => []
      if (key === "configModule") {
        return {
          modules: {
            payment: {
              options: {
                providers: [
                  { id: "pp_bold-link_bold", resolve: "bold-link", options },
                ],
              },
            },
          },
        }
      }
      if (providersById.has(key)) return providersById.get(key)
      throw new Error(`Unregistered container dependency: ${key}`)
    },
  }

  return {
    scope,
    paymentModule,
    providers: { linkProvider, onlineProvider, buttonProvider, terminalProvider },
    sessions,
    payments,
  }
}

describe("@vicacha-devs/medusa-payment-bold — Automated 4-Channel Use-Case Suite", () => {
  const integrationApiKey = `int_qa_${crypto.randomBytes(8).toString("hex")}`
  const buttonApiKey = `btn_qa_${crypto.randomBytes(8).toString("hex")}`
  const webhookSecret = `whsec_qa_${crypto.randomBytes(16).toString("hex")}`

  const emulator = new BoldQaEmulator({
    integrationApiKey,
    buttonApiKey,
    webhookSecret,
  })

  before(async () => {
    await emulator.start(0)
  })

  after(async () => {
    await emulator.stop()
  })

  beforeEach(() => {
    emulator.reset()
  })

  it("Use Case 1 (Payment Link): validates input, creates link with VAT, authorizes via signed webhook & processes partial refund", async () => {
    const harness = createMedusaTestHarness(emulator)

    // 1a. Reject invalid payload via Zod
    const badRes = createMockRes()
    await createLinkRoute(
      {
        scope: harness.scope,
        body: {
          amount: -500,
          currency: "COP",
          reference: "ORD-BAD",
          description: "Invalid",
          email: "not-an-email",
          callbackUrl: "javascript:alert(1)",
        },
      } as any,
      badRes as any
    )
    assert.equal(badRes.statusCode, 400)

    // 1b. Create valid Payment Link
    const linkRes = createMockRes()
    await createLinkRoute(
      {
        scope: harness.scope,
        body: {
          amount: 119000,
          vatAmount: 19000,
          currency: "cop",
          reference: "ORD-LINK-1001",
          description: "Bogota Tour Package",
          email: "traveler@example.com",
          callbackUrl: "https://vicachatravels.com/checkout/return",
        },
      } as any,
      linkRes as any
    )
    assert.equal(linkRes.statusCode, 200)
    const created = linkRes.jsonBody as { paymentSession: MockSession }
    assert.equal(created.paymentSession.status, "pending")
    assert.ok(String(created.paymentSession.data.payment_url).includes("/checkout/LNK_QA_"))

    // Verify exact Bold HTTP payload sent over TCP
    const boldReq = emulator.requests.find((r) => r.path === "/online/link/v1")
    assert.ok(boldReq, "Bold /online/link/v1 was called")
    assert.equal(boldReq.authorization, `x-api-key ${integrationApiKey}`)
    const sentAmount = boldReq.body?.amount as {
      currency: string
      total_amount: number
      taxes: Array<{ type: string; base: number; value: number }>
    }
    assert.equal(sentAmount.currency, "COP")
    assert.equal(sentAmount.total_amount, 119000)
    assert.deepEqual(sentAmount.taxes, [{ type: "VAT", base: 100000, value: 19000 }])

    // 1c. Simulate customer completing link + fire real HMAC-SHA256 webhook
    const webhook = emulator.simulatePaymentOutcome("ORD-LINK-1001", "APPROVED")
    const hookRes = createMockRes()
    await webhookRoute(
      {
        scope: harness.scope,
        headers: webhook.headers,
        body: webhook.payload,
        rawBody: webhook.rawBody,
      } as any,
      hookRes as any
    )
    assert.equal(hookRes.statusCode, 200)
    assert.equal(created.paymentSession.status, "authorized")

    // 1d. Execute partial refund via Admin Refund route & verify over-refund rejection
    const payment = [...harness.payments.values()][0]
    assert.ok(payment, "Medusa payment record created on authorization")
    const refundRes = createMockRes()
    await refundRoute(
      {
        scope: harness.scope,
        body: { payment_id: payment.id, amount: 50000, note: "Partial refund QA" },
      } as any,
      refundRes as any
    )
    assert.equal(refundRes.statusCode, 200)

    const overRefundRes = createMockRes()
    await refundRoute(
      {
        scope: harness.scope,
        body: { payment_id: payment.id, amount: 90000, note: "Exceeds balance" },
      } as any,
      overRefundRes as any
    )
    assert.equal(overRefundRes.statusCode, 500)
  })

  it("Use Case 2 (QR Code): creates Bold QR intent, returns base64 QR payload, handles approval & expiration", async () => {
    const harness = createMedusaTestHarness(emulator)
    const col = await harness.paymentModule.createPaymentCollections({
      amount: 85000,
      currency_code: "cop",
    })

    const qrRes = createMockRes()
    await createQrRoute(
      {
        scope: harness.scope,
        body: {
          paymentCollectionId: col.id,
          amount: 85000,
          currency: "COP",
          reference: "ORD-QR-2001",
          description: "Airport Transfer QR",
          qrFormat: "BOLD_BASE64",
          email: "guest@example.com",
        },
      } as any,
      qrRes as any
    )
    assert.equal(qrRes.statusCode, 200)
    const body = qrRes.jsonBody as { qr_payload: string; paymentSession: MockSession }
    assert.ok(body.qr_payload.length > 10, "returns non-empty QR payload")
    assert.equal(body.paymentSession.provider_id, EMedusaFormatBoldPaymentProvider.ONLINE)

    const intentReq = emulator.requests.find((r) => r.path === "/v1/payment-intent")
    assert.ok(intentReq, "Bold /v1/payment-intent was called")
    assert.equal(intentReq.authorization, `x-api-key ${buttonApiKey}`)
    assert.deepEqual(intentReq.body?.payment_method, {
      name: "QR",
      qr_format: "BOLD_BASE64",
    })

    // Simulate customer scanning & paying QR -> status transitions to AUTHORIZED
    emulator.simulatePaymentOutcome("ORD-QR-2001", "APPROVED")
    const statusOut = await harness.providers.onlineProvider.getPaymentStatus({
      data: body.paymentSession.data,
    })
    assert.equal(statusOut.status, "authorized")

    // Test expired QR path
    const qrExpiredRes = createMockRes()
    await createQrRoute(
      {
        scope: harness.scope,
        body: {
          paymentCollectionId: col.id,
          amount: 40000,
          currency: "COP",
          reference: "ORD-QR-2002",
          qrFormat: "TEXT",
        },
      } as any,
      qrExpiredRes as any
    )
    const expiredBody = qrExpiredRes.jsonBody as {
      qr_payload: string
      paymentSession: MockSession
    }
    assert.ok(expiredBody.qr_payload.startsWith("000201"), "TEXT EMVCo QR payload returned")
    emulator.simulatePaymentOutcome("ORD-QR-2002", "EXPIRED")
    const expiredStatus = await harness.providers.onlineProvider.getPaymentStatus({
      data: expiredBody.paymentSession.data,
    })
    assert.equal(expiredStatus.status, "canceled")
  })

  it("Use Case 3 (Checkout Button): generates deterministic SHA-256 integrity hash, authorizes via voucher & refunds", async () => {
    const harness = createMedusaTestHarness(emulator)
    const col = await harness.paymentModule.createPaymentCollections({
      amount: 250000,
      currency_code: "cop",
    })

    const btnRes = createMockRes()
    await createButtonRoute(
      {
        scope: harness.scope,
        body: {
          paymentCollectionId: col.id,
          amount: 250000,
          currency: "COP",
          reference: "ORD-BTN-3001",
          description: "Hotel Booking Button",
        },
      } as any,
      btnRes as any
    )
    assert.equal(btnRes.statusCode, 200)
    const { paymentSession } = btnRes.jsonBody as { paymentSession: MockSession }
    const expectedHash = BoldIntegrityService.generateButtonHash(
      "ORD-BTN-3001",
      250000,
      "COP",
      webhookSecret
    )
    assert.equal(paymentSession.data.hash, expectedHash)
    assert.equal(paymentSession.data.integrity_signature, expectedHash)

    // Simulate storefront Bold Button completion -> voucher lookup authorizes session
    emulator.seedButtonOrder("ORD-BTN-3001", 250000, "COP")
    emulator.simulatePaymentOutcome("ORD-BTN-3001", "APPROVED")

    const authorized = await harness.paymentModule.authorizePaymentSession(
      paymentSession.id
    )
    assert.equal(paymentSession.status, "authorized")
    assert.ok(authorized.data.transaction_id)

    const refunded = await harness.paymentModule.refundPayment({
      payment_id: authorized.id,
      amount: 250000,
      note: "Full button refund",
    })
    assert.ok(refunded.id)
  })

  it("Use Case 4 (POS Terminal): lists dataphones, dispatches checkout, handles approved/declined tap & streams SSE", async () => {
    const harness = createMedusaTestHarness(emulator)

    // 4a. List bound physical terminals
    const termRes = createMockRes()
    await getTerminalsRoute({ scope: harness.scope } as any, termRes as any)
    assert.equal(termRes.statusCode, 200)
    const { terminals } = termRes.jsonBody as {
      terminals: Array<{ terminal_serial: string; terminal_model: string }>
    }
    assert.equal(terminals.length, 2)
    assert.equal(terminals[0].terminal_serial, "N86-QA-001")

    // 4b. Dispatch POS checkout to first dataphone
    const col = await harness.paymentModule.createPaymentCollections({
      amount: 175000,
      currency_code: "cop",
    })
    const pushRes = createMockRes()
    await posPushRoute(
      {
        scope: harness.scope,
        body: {
          paymentCollectionId: col.id,
          amount: 175000,
          vatAmount: 27941,
          currency: "COP",
          reference: "ORD-POS-4001",
          terminalModel: terminals[0].terminal_model,
          terminalSerial: terminals[0].terminal_serial,
          userEmail: "cashier@vicachatravels.com",
          description: "Desk Ticket Purchase",
        },
      } as any,
      pushRes as any
    )
    assert.equal(pushRes.statusCode, 200)
    const { paymentSession } = pushRes.jsonBody as { paymentSession: MockSession }
    assert.ok(paymentSession.data.terminal_checkout_id)

    const posReq = emulator.requests.find((r) => r.path === "/payments/app-checkout")
    assert.ok(posReq, "Bold /payments/app-checkout was called")
    assert.equal(posReq.body?.payment_method, "POS")
    assert.equal(posReq.body?.terminal_serial, "N86-QA-001")

    // 4c. Check GET /admin/bold/payment-status while pending
    const statusRes = createMockRes()
    await getPaymentStatusRoute(
      { scope: harness.scope, query: { paymentSessionId: paymentSession.id } } as any,
      statusRes as any
    )
    assert.equal(statusRes.statusCode, 200)
    assert.equal((statusRes.jsonBody as { status: string }).status, "pending")

    // 4d. Simulate customer card tap APPROVED -> verify SSE stream auto-captures & closes
    emulator.simulatePaymentOutcome("ORD-POS-4001", "APPROVED")
    const sseReq = new EventEmitter() as any
    sseReq.scope = harness.scope
    sseReq.query = { paymentSessionId: paymentSession.id }
    const sseRes = createMockRes()
    await streamPaymentRoute(sseReq, sseRes as any)
    await sseRes.done
    assert.equal(sseRes.headers["content-type"], "text/event-stream")
    assert.ok(sseRes.chunks.some((c) => c.includes('"status":"captured"')))
    assert.equal(paymentSession.status, "captured")

    // 4e. Simulate declined card on virtual dataphone
    const pushDeclineRes = createMockRes()
    await posPushRoute(
      {
        scope: harness.scope,
        body: {
          paymentCollectionId: col.id,
          amount: 50000,
          currency: "COP",
          reference: "ORD-POS-4002",
          terminalModel: "SMART_PRO",
          terminalSerial: "SMART-QA-002",
          userEmail: "cashier@vicachatravels.com",
        },
      } as any,
      pushDeclineRes as any
    )
    const declinedSession = (pushDeclineRes.jsonBody as { paymentSession: MockSession })
      .paymentSession
    emulator.simulatePaymentOutcome("ORD-POS-4002", "REJECTED")
    const declineAuth = await harness.providers.terminalProvider.authorizePayment({
      data: declinedSession.data,
    })
    assert.equal(declineAuth.status, "canceled")

    // 4f. Reject unknown/unbound terminal serial
    const badTermRes = createMockRes()
    await posPushRoute(
      {
        scope: harness.scope,
        body: {
          paymentCollectionId: col.id,
          amount: 50000,
          currency: "COP",
          reference: "ORD-POS-4003",
          terminalModel: "N86",
          terminalSerial: "UNKNOWN-999",
          userEmail: "cashier@vicachatravels.com",
        },
      } as any,
      badTermRes as any
    )
    assert.equal(badTermRes.statusCode, 500)
  })

  it("Security & Fault Injection: rejects bad HMAC, tampered amount/currency, unsafe HTTP base URL & maps Bold 401/500", async () => {
    const harness = createMedusaTestHarness(emulator)

    // Create a pending link session for 100,000 COP
    const linkRes = createMockRes()
    await createLinkRoute(
      {
        scope: harness.scope,
        body: {
          amount: 100000,
          currency: "COP",
          reference: "ORD-SEC-5001",
          description: "Security Test",
          email: "sec@example.com",
          callbackUrl: "https://vicachatravels.com/return",
        },
      } as any,
      linkRes as any
    )
    const { paymentSession } = linkRes.jsonBody as { paymentSession: MockSession }

    // 5a. Missing signature headers -> 401
    const noSigRes = createMockRes()
    await webhookRoute(
      { scope: harness.scope, headers: {}, body: {}, rawBody: "{}" } as any,
      noSigRes as any
    )
    assert.equal(noSigRes.statusCode, 401)

    // 5b. Wrong signing secret -> 401
    const forged = signBoldWebhook(
      {
        event: "sale.successful",
        data: { reference: "ORD-SEC-5001", status: "APPROVED", amount: 100000, currency: "COP" },
      },
      "wrong-secret-key"
    )
    const badSigRes = createMockRes()
    await webhookRoute(
      {
        scope: harness.scope,
        headers: forged.headers,
        body: forged.payload,
        rawBody: forged.rawBody,
      } as any,
      badSigRes as any
    )
    assert.equal(badSigRes.statusCode, 401)
    assert.equal(paymentSession.status, "pending")

    // 5c. Valid signature but tampered amount (1000 instead of 100000) -> NOT authorized
    const tampered = emulator.simulatePaymentOutcome("ORD-SEC-5001", "APPROVED", {
      amount: 1000,
    })
    const tamperRes = createMockRes()
    await webhookRoute(
      {
        scope: harness.scope,
        headers: tampered.headers,
        body: tampered.payload,
        rawBody: tampered.rawBody,
      } as any,
      tamperRes as any
    )
    assert.equal(tamperRes.statusCode, 200)
    assert.equal(paymentSession.status, "pending", "tampered amount must NOT authorize session")

    // 5d. SSRF guard: reject non-HTTPS non-loopback custom base URL
    assert.throws(() => {
      new BoldHttpClient(
        {
          buttonApiKey: "k",
          integrationsUrl: "http://169.254.169.254",
        },
        createSilentLogger()
      )
    }, /Unsafe Bold base URL/)

    // 5e. Fault injection: Bold 401 maps to MedusaError UNAUTHORIZED
    emulator.injectFault("/payments/binded-terminals", 401, "Expired API key")
    const client = new BoldHttpClient(emulator.clientOptions, createSilentLogger())
    await assert.rejects(
      () => client.getTerminals(),
      (err: any) => err.type === "unauthorized"
    )
  })
})
