import crypto from "node:crypto"
import http from "node:http"

export interface EmulatorTerminal {
  terminal_serial: string
  terminal_model: string
  status: "READY" | "BUSY" | "OFFLINE"
  name: string
}

export interface RecordedRequest {
  method: string
  path: string
  authorization?: string
  body: Record<string, unknown> | null
}

interface StoredTransaction {
  id: string
  reference: string
  linkId?: string
  channel: "LINK" | "QR" | "ONLINE" | "BUTTON" | "POS"
  amount: number
  currency: string
  status:
    | "ACTIVE"
    | "PROCESSING"
    | "APPROVED"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED"
  transactionId: string
  paymentMethod: string
  refundedAmount: number
  terminalSerial?: string
  terminalModel?: string
}

export interface BoldEmulatorConfig {
  integrationApiKey: string
  buttonApiKey: string
  webhookSecret: string
  terminals?: EmulatorTerminal[]
}

export interface SignedWebhookEnvelope {
  rawBody: string
  payload: Record<string, unknown>
  headers: Record<string, string>
}

export function signBoldWebhook(
  payload: Record<string, unknown>,
  secretKey: string,
  timestamp = String(Date.now())
): SignedWebhookEnvelope {
  const rawBody = JSON.stringify(payload)
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(`${timestamp}${rawBody}`)
    .digest("hex")
  return {
    rawBody,
    payload,
    headers: {
      "content-type": "application/json",
      "x-bold-signature": signature,
      "x-bold-timestamp": timestamp,
    },
  }
}

export class BoldQaEmulator {
  private server: http.Server | null = null
  private baseUrl = ""
  private seq = 1
  private readonly cfg: BoldEmulatorConfig
  private readonly transactionsByRef = new Map<string, StoredTransaction>()
  private readonly transactionsByLinkId = new Map<string, StoredTransaction>()
  private readonly transactionsByTxId = new Map<string, StoredTransaction>()
  private readonly terminals: EmulatorTerminal[]
  private nextFault: {
    pathContains: string
    status: number
    message: string
  } | null = null
  public readonly requests: RecordedRequest[] = []

  constructor(cfg: BoldEmulatorConfig) {
    this.cfg = cfg
    this.terminals = cfg.terminals ?? [
      {
        terminal_serial: "N86-QA-001",
        terminal_model: "N86",
        status: "READY",
        name: "QA Dataphone Counter 1",
      },
      {
        terminal_serial: "SMART-QA-002",
        terminal_model: "SMART_PRO",
        status: "READY",
        name: "QA Dataphone Mobile 2",
      },
    ]
  }

  get url(): string {
    return this.baseUrl
  }

  get clientOptions() {
    return {
      buttonApiKey: this.cfg.buttonApiKey,
      buttonSecretKey: this.cfg.webhookSecret,
      integrationApiKey: this.cfg.integrationApiKey,
      integrationSecretKey: this.cfg.webhookSecret,
      defaultCurrency: "COP",
      linkExpirationMinutes: 15,
      integrationsUrl: this.baseUrl,
      onlineUrl: this.baseUrl,
      paymentsUrl: `${this.baseUrl}/v2/payment-voucher`,
    }
  }

  reset(): void {
    this.requests.length = 0
    this.transactionsByRef.clear()
    this.transactionsByLinkId.clear()
    this.transactionsByTxId.clear()
    this.nextFault = null
  }

  injectFault(pathContains: string, status: number, message: string): void {
    this.nextFault = { pathContains, status, message }
  }

  seedButtonOrder(reference: string, amount: number, currency = "COP"): void {
    const tx: StoredTransaction = {
      id: `btn_${this.seq++}`,
      reference,
      channel: "BUTTON",
      amount,
      currency: currency.toUpperCase(),
      status: "ACTIVE",
      transactionId: `tx_btn_${this.seq}`,
      paymentMethod: "BOLD_BUTTON",
      refundedAmount: 0,
    }
    this.transactionsByRef.set(reference, tx)
    this.transactionsByTxId.set(tx.transactionId, tx)
  }

  simulatePaymentOutcome(
    referenceOrLinkId: string,
    outcome: "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED",
    overrides?: { amount?: number; currency?: string; paymentMethod?: string }
  ): SignedWebhookEnvelope {
    const tx =
      this.transactionsByRef.get(referenceOrLinkId) ||
      this.transactionsByLinkId.get(referenceOrLinkId)
    if (!tx) {
      throw new Error(`Emulator has no transaction for "${referenceOrLinkId}"`)
    }
    tx.status = outcome
    if (overrides?.paymentMethod) {
      tx.paymentMethod = overrides.paymentMethod
    }

    const eventMap: Record<typeof outcome, string> = {
      APPROVED: "sale.successful",
      REJECTED: "sale.rejected",
      EXPIRED: "sale.failed",
      CANCELLED: "sale.failed",
    }

    const payload = {
      event: eventMap[outcome],
      data: {
        id: tx.transactionId,
        reference: tx.reference,
        amount: overrides?.amount ?? tx.amount,
        currency: overrides?.currency ?? tx.currency,
        status: outcome,
        payment_method: tx.paymentMethod,
      },
    }
    return signBoldWebhook(payload, this.cfg.webhookSecret)
  }

  async start(port = 0): Promise<string> {
    this.server = http.createServer((req, res) => {
      void this.handleRequest(req, res)
    })
    await new Promise<void>((resolve) => {
      this.server?.listen(port, "127.0.0.1", () => resolve())
    })
    const addr = this.server.address()
    if (!addr || typeof addr === "string") {
      throw new Error("Failed to bind BoldQaEmulator on 127.0.0.1")
    }
    this.baseUrl = `http://127.0.0.1:${addr.port}`
    return this.baseUrl
  }

  async stop(): Promise<void> {
    if (!this.server) return
    await new Promise<void>((resolve, reject) => {
      this.server?.close((err) => (err ? reject(err) : resolve()))
    })
    this.server = null
  }

  private sendJson(
    res: http.ServerResponse,
    status: number,
    body: unknown
  ): void {
    res.writeHead(status, { "content-type": "application/json" })
    res.end(JSON.stringify(body))
  }

  private async readBody(
    req: http.IncomingMessage
  ): Promise<Record<string, unknown> | null> {
    const chunks: Buffer[] = []
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const raw = Buffer.concat(chunks).toString("utf8").trim()
    if (!raw) return null
    try {
      return JSON.parse(raw) as Record<string, unknown>
    } catch {
      return null
    }
  }

  private checkApiKey(
    req: http.IncomingMessage,
    expectedKey: string,
    res: http.ServerResponse
  ): boolean {
    const auth = req.headers.authorization || ""
    if (auth !== `x-api-key ${expectedKey}`) {
      this.sendJson(res, 401, { message: "Invalid Bold API key" })
      return false
    }
    return true
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const url = new URL(req.url || "/", this.baseUrl || "http://127.0.0.1")
    const method = (req.method || "GET").toUpperCase()
    const pathname = url.pathname
    const body = await this.readBody(req)

    if (!pathname.startsWith("/__qa/")) {
      this.requests.push({
        method,
        path: pathname,
        authorization: req.headers.authorization,
        body,
      })
    }

    if (this.nextFault && pathname.includes(this.nextFault.pathContains)) {
      const fault = this.nextFault
      this.nextFault = null
      this.sendJson(res, fault.status, { message: fault.message })
      return
    }

    // QA Control Endpoints
    if (method === "GET" && pathname === "/__qa/health") {
      this.sendJson(res, 200, { status: "ok", emulator: "bold-qa" })
      return
    }
    if (method === "GET" && pathname === "/__qa/requests") {
      this.sendJson(res, 200, { requests: this.requests })
      return
    }
    if (method === "POST" && pathname === "/__qa/reset") {
      this.reset()
      this.sendJson(res, 200, { reset: true })
      return
    }
    if (method === "POST" && pathname === "/__qa/fault") {
      this.injectFault(
        String(body?.pathContains || "/"),
        Number(body?.status || 500),
        String(body?.message || "Injected QA fault")
      )
      this.sendJson(res, 200, { injected: true })
      return
    }
    if (method === "POST" && pathname === "/__qa/simulate-payment") {
      const ref = String(body?.reference || body?.linkId || "")
      const outcome = (body?.outcome || "APPROVED") as
        | "APPROVED"
        | "REJECTED"
        | "EXPIRED"
        | "CANCELLED"
      if (body?.seedButton && ref) {
        this.seedButtonOrder(
          ref,
          Number(body?.amount || 0),
          String(body?.currency || "COP")
        )
      }
      const envelope = this.simulatePaymentOutcome(ref, outcome)
      const webhookUrl = body?.webhookUrl ? String(body.webhookUrl) : ""
      let webhookStatus: number | null = null
      if (webhookUrl) {
        const parsedHook = new URL(webhookUrl)
        if (
          parsedHook.hostname !== "127.0.0.1" &&
          parsedHook.hostname !== "localhost"
        ) {
          this.sendJson(res, 400, {
            message: "webhookUrl must target 127.0.0.1/localhost",
          })
          return
        }
        const hookRes = await fetch(webhookUrl, {
          method: "POST",
          headers: envelope.headers,
          body: envelope.rawBody,
        })
        webhookStatus = hookRes.status
      }
      this.sendJson(res, 200, {
        simulated: true,
        outcome,
        webhookStatus,
        envelope,
      })
      return
    }

    // 1. Payment Link API (integrationApiKey)
    if (method === "POST" && pathname === "/online/link/v1") {
      if (!this.checkApiKey(req, this.cfg.integrationApiKey, res)) return
      const reference = String(body?.reference || `ref_${this.seq}`)
      const amountObj = (body?.amount || {}) as Record<string, unknown>
      const linkId = `LNK_QA_${this.seq++}`
      const tx: StoredTransaction = {
        id: linkId,
        linkId,
        reference,
        channel: "LINK",
        amount: Number(amountObj.total_amount || 0),
        currency: String(amountObj.currency || "COP"),
        status: "ACTIVE",
        transactionId: `tx_link_${this.seq}`,
        paymentMethod: "PAYMENT_LINK",
        refundedAmount: 0,
      }
      this.transactionsByRef.set(reference, tx)
      this.transactionsByLinkId.set(linkId, tx)
      this.transactionsByTxId.set(tx.transactionId, tx)
      this.sendJson(res, 200, {
        payload: {
          payment_link: linkId,
          url: `${this.baseUrl}/checkout/${linkId}`,
        },
        errors: [],
      })
      return
    }

    if (method === "GET" && pathname === "/online/link/v1/payment_methods") {
      if (!this.checkApiKey(req, this.cfg.integrationApiKey, res)) return
      this.sendJson(res, 200, {
        payload: {
          payment_methods: {
            CREDIT_CARD: { min: 1000, max: 50000000 },
            PSE: { min: 1000, max: 50000000 },
            NEQUI: { min: 1000, max: 10000000 },
            BOTON_BANCOLOMBIA: { min: 1000, max: 20000000 },
          },
        },
        errors: [],
      })
      return
    }

    if (method === "GET" && pathname.startsWith("/online/link/v1/")) {
      if (!this.checkApiKey(req, this.cfg.integrationApiKey, res)) return
      const linkId = decodeURIComponent(
        pathname.slice("/online/link/v1/".length)
      )
      const tx = this.transactionsByLinkId.get(linkId)
      if (!tx) {
        this.sendJson(res, 404, { message: `Link ${linkId} not found` })
        return
      }
      this.sendJson(res, 200, {
        link_id: linkId,
        reference_id: tx.reference,
        total: tx.amount,
        subtotal: tx.amount,
        description: `Order ${tx.reference}`,
        payment_status: tx.status,
        status: tx.status,
        transaction_id: tx.transactionId,
        payment_method: tx.paymentMethod,
      })
      return
    }

    // 2. POS Terminals API (integrationApiKey)
    if (method === "GET" && pathname === "/payments/binded-terminals") {
      if (!this.checkApiKey(req, this.cfg.integrationApiKey, res)) return
      this.sendJson(res, 200, {
        payload: { available_terminals: this.terminals },
        errors: [],
      })
      return
    }

    if (method === "GET" && pathname === "/payments/payment-methods") {
      if (!this.checkApiKey(req, this.cfg.integrationApiKey, res)) return
      this.sendJson(res, 200, {
        payment_methods: [
          { name: "POS", enabled: true },
          { name: "NEQUI", enabled: true },
          { name: "DAVIPLATA", enabled: true },
        ],
        errors: [],
      })
      return
    }

    if (method === "POST" && pathname === "/payments/app-checkout") {
      if (!this.checkApiKey(req, this.cfg.integrationApiKey, res)) return
      const serial = String(body?.terminal_serial || "")
      const model = String(body?.terminal_model || "")
      const found = this.terminals.find(
        (t) => t.terminal_serial === serial && t.terminal_model === model
      )
      if (!found) {
        this.sendJson(res, 404, {
          message: `Terminal ${model}/${serial} not bound to merchant account`,
        })
        return
      }
      const reference = String(body?.reference || `pos_${this.seq}`)
      const amountObj = (body?.amount || {}) as Record<string, unknown>
      const checkoutId = `pos_chk_${this.seq++}`
      const tx: StoredTransaction = {
        id: checkoutId,
        reference,
        channel: "POS",
        amount: Number(amountObj.total || 0),
        currency: String(amountObj.currency || "COP"),
        status: "PROCESSING",
        transactionId: `tx_pos_${this.seq}`,
        paymentMethod: "POS",
        refundedAmount: 0,
        terminalSerial: serial,
        terminalModel: model,
      }
      this.transactionsByRef.set(reference, tx)
      this.transactionsByTxId.set(tx.transactionId, tx)
      this.sendJson(res, 200, { payload: { id: checkoutId } })
      return
    }

    // 3. Online / QR / PSE Payment Intent API (buttonApiKey)
    if (method === "POST" && pathname === "/v1/payment-intent") {
      if (!this.checkApiKey(req, this.cfg.buttonApiKey, res)) return
      const reference = String(body?.reference_id || `qr_${this.seq}`)
      const pm = (body?.payment_method || {}) as Record<string, unknown>
      const pmName = String(pm.name || "QR")
      const intentId = `pi_qa_${this.seq++}`
      const qrFormat = String(pm.qr_format || "BOLD_BASE64")
      const qrPayload =
        qrFormat === "TEXT"
          ? `00020101021226BOLDQA${reference}5802CO6304ABCD`
          : Buffer.from(`BOLD_QR_IMAGE:${reference}:${qrFormat}`).toString(
              "base64"
            )

      const tx: StoredTransaction = {
        id: intentId,
        reference,
        channel: pmName === "QR" ? "QR" : "ONLINE",
        amount: Number(
          (body?.metadata as Record<string, unknown>)?.amount || 0
        ),
        currency: "COP",
        status: "ACTIVE",
        transactionId: `tx_online_${this.seq}`,
        paymentMethod: pmName,
        refundedAmount: 0,
      }
      this.transactionsByRef.set(reference, tx)
      this.transactionsByTxId.set(tx.transactionId, tx)

      this.sendJson(res, 200, {
        id: intentId,
        status: "PENDING",
        reference_id: reference,
        payment_url: `${this.baseUrl}/pay/${intentId}`,
        payment_method: {
          name: pmName,
          qr_format: qrFormat,
          qr_payload: qrPayload,
        },
      })
      return
    }

    if (method === "GET" && pathname === "/v1/payment/pse/banks") {
      if (!this.checkApiKey(req, this.cfg.buttonApiKey, res)) return
      this.sendJson(res, 200, [
        { bank_code: "1007", bank_name: "BANCOLOMBIA" },
        { bank_code: "1051", bank_name: "DAVIVIENDA" },
      ])
      return
    }

    // 4. Voucher lookup & Refunds (buttonApiKey)
    if (method === "GET" && pathname.startsWith("/v2/payment-voucher/")) {
      if (!this.checkApiKey(req, this.cfg.buttonApiKey, res)) return
      const reference = decodeURIComponent(
        pathname.slice("/v2/payment-voucher/".length)
      )
      const tx = this.transactionsByRef.get(reference)
      if (!tx) {
        this.sendJson(res, 404, {
          message: `Voucher for ${reference} not found`,
        })
        return
      }
      this.sendJson(res, 200, {
        payload: {
          reference_id: tx.reference,
          status: tx.status,
          payment_status: tx.status,
          transaction_id: tx.transactionId,
          payment_method: tx.paymentMethod,
          total: tx.amount,
        },
      })
      return
    }

    if (method === "POST" && pathname === "/v1/refunds") {
      if (!this.checkApiKey(req, this.cfg.buttonApiKey, res)) return
      const txId = String(body?.transaction_id || "")
      const amount = Number(body?.amount || 0)
      const tx = this.transactionsByTxId.get(txId)
      if (!tx) {
        this.sendJson(res, 404, { message: `Transaction ${txId} not found` })
        return
      }
      if (tx.amount > 0 && tx.refundedAmount + amount > tx.amount) {
        this.sendJson(res, 422, {
          message: "Refund amount exceeds remaining captured balance",
        })
        return
      }
      tx.refundedAmount += amount
      this.sendJson(res, 200, {
        refund_id: `rf_qa_${this.seq++}`,
        transaction_id: txId,
        amount,
        status: "REFUNDED",
        created_at: new Date().toISOString(),
      })
      return
    }

    this.sendJson(res, 404, {
      message: `Unhandled route ${method} ${pathname}`,
    })
  }
}
