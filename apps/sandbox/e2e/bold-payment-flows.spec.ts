import { expect, test } from "@playwright/test"

const emulatorUrl = process.env.BOLD_EMULATOR_URL || ""
const adminToken = process.env.MEDUSA_QA_ADMIN_TOKEN || ""
const paymentCollectionId = process.env.MEDUSA_QA_PAYMENT_COLLECTION_ID || ""

test.describe("Bold Payment Flows E2E (Link, QR, Button & POS via Bold QA Emulator)", () => {
  test.skip(
    !emulatorUrl || !adminToken || !paymentCollectionId,
    "Set BOLD_EMULATOR_URL, MEDUSA_QA_ADMIN_TOKEN, and MEDUSA_QA_PAYMENT_COLLECTION_ID to run live sandbox Bold E2E"
  )

  test("executes Payment Link -> simulated Bold webhook -> authorized status", async ({
    request,
    baseURL,
  }) => {
    const authHeaders = { Authorization: `Bearer ${adminToken}` }
    const reference = `E2E-LINK-${Date.now()}`

    const createRes = await request.post("/admin/bold/payment-link", {
      headers: authHeaders,
      data: {
        paymentCollectionId,
        amount: 119000,
        vatAmount: 19000,
        currency: "COP",
        reference,
        description: "Playwright Bold Link E2E",
        email: "qa@vicachatravels.com",
        callbackUrl: `${baseURL}/app`,
      },
    })
    expect(createRes.status()).toBe(200)
    const { paymentSession } = await createRes.json()
    expect(paymentSession?.data?.payment_url).toBeTruthy()

    const simRes = await request.post(`${emulatorUrl}/__qa/simulate-payment`, {
      data: {
        reference,
        outcome: "APPROVED",
        webhookUrl: `${baseURL}/hooks/payment/bold`,
      },
    })
    expect(simRes.status()).toBe(200)

    const statusRes = await request.get(
      `/admin/bold/payment-status?paymentSessionId=${encodeURIComponent(paymentSession.id)}`,
      { headers: authHeaders }
    )
    expect(statusRes.status()).toBe(200)
    const statusJson = await statusRes.json()
    expect(["authorized", "captured"]).toContain(statusJson.status)
  })

  test("executes QR Code & POS Terminal push against virtual Bold dataphone", async ({
    request,
    baseURL,
  }) => {
    const authHeaders = { Authorization: `Bearer ${adminToken}` }

    const qrRes = await request.post("/admin/bold/payment-qr", {
      headers: authHeaders,
      data: {
        paymentCollectionId,
        amount: 75000,
        currency: "COP",
        reference: `E2E-QR-${Date.now()}`,
        qrFormat: "BOLD_BASE64",
      },
    })
    expect(qrRes.status()).toBe(200)
    const qrJson = await qrRes.json()
    expect(qrJson.qr_payload).toBeTruthy()

    const termsRes = await request.get("/admin/bold/terminals", {
      headers: authHeaders,
    })
    expect(termsRes.status()).toBe(200)
    const { terminals } = await termsRes.json()
    expect(terminals.length).toBeGreaterThan(0)

    const posRef = `E2E-POS-${Date.now()}`
    const posRes = await request.post("/admin/bold/pos-push", {
      headers: authHeaders,
      data: {
        paymentCollectionId,
        amount: 95000,
        currency: "COP",
        reference: posRef,
        terminalModel: terminals[0].terminal_model,
        terminalSerial: terminals[0].terminal_serial,
        userEmail: "qa@vicachatravels.com",
      },
    })
    expect(posRes.status()).toBe(200)
    const { paymentSession } = await posRes.json()

    const simRes = await request.post(`${emulatorUrl}/__qa/simulate-payment`, {
      data: {
        reference: posRef,
        outcome: "APPROVED",
        webhookUrl: `${baseURL}/hooks/payment/bold`,
      },
    })
    expect(simRes.status()).toBe(200)
    expect(paymentSession.id).toBeTruthy()
  })
})
