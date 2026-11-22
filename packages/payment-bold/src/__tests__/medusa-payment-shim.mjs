export const Modules = {
  PAYMENT: "payment",
  ORDER: "order",
  CART: "cart",
  PRODUCT: "product",
  EVENT_BUS: "event_bus",
}

// Type-only symbol stubs for TS files importing Medusa interfaces without `import type`
export const IPaymentModuleService = undefined
export const MedusaRequest = undefined
export const MedusaResponse = undefined
export const AuthenticatedMedusaRequest = undefined
export const Logger = undefined
export const ConfigModule = undefined
export const MedusaContainer = undefined
export const InitiatePaymentInput = undefined
export const InitiatePaymentOutput = undefined
export const AuthorizePaymentInput = undefined
export const AuthorizePaymentOutput = undefined
export const CapturePaymentInput = undefined
export const CapturePaymentOutput = undefined
export const CancelPaymentInput = undefined
export const CancelPaymentOutput = undefined
export const RefundPaymentInput = undefined
export const RefundPaymentOutput = undefined
export const DeletePaymentInput = undefined
export const DeletePaymentOutput = undefined
export const UpdatePaymentInput = undefined
export const UpdatePaymentOutput = undefined
export const GetPaymentStatusInput = undefined
export const GetPaymentStatusOutput = undefined
export const ProviderWebhookPayload = undefined
export const WebhookActionResult = undefined

export const ContainerRegistrationKeys = {
  LOGGER: "logger",
  CONFIG_MODULE: "configModule",
  REMOTE_QUERY: "remoteQuery",
}

export const PaymentSessionStatus = {
  AUTHORIZED: "authorized",
  CAPTURED: "captured",
  PENDING: "pending",
  REQUIRES_MORE: "requires_more",
  ERROR: "error",
  CANCELED: "canceled",
}

export const PaymentActions = {
  AUTHORIZED: "authorized",
  SUCCESSFUL: "captured",
  FAILED: "failed",
  CANCELED: "canceled",
  NOT_SUPPORTED: "not_supported",
}

export class AbstractPaymentProvider {
  constructor(container, options) {
    this.__container = container
    this.__options = options
  }
}

export class MedusaError extends Error {
  static Types = {
    DB_ERROR: "database_error",
    DUPLICATE_ERROR: "duplicate_error",
    INVALID_ARGUMENT: "invalid_argument",
    INVALID_DATA: "invalid_data",
    UNAUTHORIZED: "unauthorized",
    NOT_FOUND: "not_found",
    NOT_ALLOWED: "not_allowed",
    UNEXPECTED_STATE: "unexpected_state",
    CONFLICT: "conflict",
  }

  constructor(type, message, code) {
    super(message)
    this.type = type
    this.code = code
    this.name = "MedusaError"
  }
}

export class StepResponse {
  constructor(output, compensateInput) {
    this.output = output
    this.compensateInput = compensateInput
  }
}

export class WorkflowResponse {
  constructor(output) {
    this.output = output
  }
}

export function createStep(name, invokeFn, compensateFn) {
  const stepFn = (input) => ({
    __stepName: name,
    input,
    invokeFn,
    compensateFn,
  })
  stepFn.__stepName = name
  stepFn.invoke = invokeFn
  stepFn.compensate = compensateFn
  return stepFn
}

export function createWorkflow(name, composerFn) {
  const wf = (container) => ({
    async run({ input } = {}) {
      const composed = composerFn(input)
      const stepDescriptor =
        composed instanceof WorkflowResponse ? composed.output : composed
      if (stepDescriptor && typeof stepDescriptor.invokeFn === "function") {
        const stepRes = await stepDescriptor.invokeFn(stepDescriptor.input, {
          container,
        })
        const result =
          stepRes instanceof StepResponse ? stepRes.output : stepRes
        return {
          result,
          compensate: async () => {
            if (typeof stepDescriptor.compensateFn === "function") {
              await stepDescriptor.compensateFn(stepRes?.compensateInput, {
                container,
              })
            }
          },
        }
      }
      return { result: stepDescriptor }
    },
  })
  wf.getName = () => name
  return wf
}

export const createPaymentSessionsWorkflow = (container) => ({
  async run({ input }) {
    const paymentModule = container.resolve(Modules.PAYMENT)
    const collection = await paymentModule.retrievePaymentCollection(
      input.payment_collection_id
    )
    const session = await paymentModule.createPaymentSession(
      input.payment_collection_id,
      {
        provider_id: input.provider_id,
        amount: collection?.amount ?? input.amount ?? 0,
        currency_code: collection?.currency_code ?? "cop",
        data: input.data,
      }
    )
    return { result: session }
  },
})

export const capturePaymentWorkflow = (container) => ({
  async run({ input }) {
    const paymentModule = container.resolve(Modules.PAYMENT)
    const payment = await paymentModule.capturePayment({
      payment_id: input.payment_id,
    })
    return { result: payment }
  },
})

export const refundPaymentWorkflow = (container) => ({
  async run({ input }) {
    const paymentModule = container.resolve(Modules.PAYMENT)
    const refund = await paymentModule.refundPayment({
      payment_id: input.payment_id,
      amount: input.amount,
      note: input.note,
    })
    return { result: refund }
  },
})

// Real lightweight validating Zod micro-shim so negative validation tests truly enforce schemas
function makeValidator(baseCheck) {
  const checks = []
  let isOptional = false
  let hasDefault = false
  let defaultVal
  let transformFn = null

  const schema = {
    min(n, msg) {
      checks.push((v) =>
        typeof v === "string"
          ? v.length >= n
            ? null
            : msg || `Must be at least ${n} chars`
          : v >= n
            ? null
            : msg || `Must be >= ${n}`
      )
      return schema
    },
    max(n, msg) {
      checks.push((v) =>
        typeof v === "string"
          ? v.length <= n
            ? null
            : msg || `Must be at most ${n} chars`
          : v <= n
            ? null
            : msg || `Must be <= ${n}`
      )
      return schema
    },
    positive(msg) {
      checks.push((v) => (v > 0 ? null : msg || "Must be positive"))
      return schema
    },
    finite(msg) {
      checks.push((v) => (Number.isFinite(v) ? null : msg || "Must be finite"))
      return schema
    },
    email(msg) {
      checks.push((v) =>
        typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          ? null
          : msg || "Invalid email"
      )
      return schema
    },
    url(msg) {
      checks.push((v) => {
        try {
          new URL(String(v))
          return null
        } catch {
          return msg || "Invalid URL"
        }
      })
      return schema
    },
    refine(fn, opts) {
      const msg = typeof opts === "string" ? opts : opts?.message || "Invalid"
      checks.push((v) => (fn(v) ? null : msg))
      return schema
    },
    transform(fn) {
      transformFn = fn
      return schema
    },
    optional() {
      isOptional = true
      return schema
    },
    default(val) {
      hasDefault = true
      defaultVal = val
      return schema
    },
    _parseValue(raw) {
      if (raw === undefined) {
        if (hasDefault) return { ok: true, value: defaultVal }
        if (isOptional) return { ok: true, value: undefined }
        return { ok: false, error: "Required" }
      }
      const base = baseCheck(raw)
      if (!base.ok) return base
      let val = base.value
      for (const check of checks) {
        const err = check(val)
        if (err) return { ok: false, error: err }
      }
      if (transformFn) val = transformFn(val)
      return { ok: true, value: val }
    },
  }
  return schema
}

export const z = {
  string: () =>
    makeValidator((v) =>
      typeof v === "string"
        ? { ok: true, value: v }
        : { ok: false, error: "Expected string" }
    ),
  number: () =>
    makeValidator((v) =>
      typeof v === "number" && !Number.isNaN(v)
        ? { ok: true, value: v }
        : { ok: false, error: "Expected number" }
    ),
  enum: (values) =>
    makeValidator((v) =>
      values.includes(v)
        ? { ok: true, value: v }
        : { ok: false, error: `Expected one of ${values.join(", ")}` }
    ),
  coerce: {
    number: () =>
      makeValidator((v) => {
        const n = Number(v)
        return Number.isNaN(n)
          ? { ok: false, error: "Expected number" }
          : { ok: true, value: n }
      }),
  },
  object: (shape) => ({
    safeParse(input) {
      const src = input && typeof input === "object" ? input : {}
      const data = {}
      const fieldErrors = {}
      let hasErrors = false
      for (const [key, validator] of Object.entries(shape)) {
        const res = validator._parseValue(src[key])
        if (!res.ok) {
          hasErrors = true
          fieldErrors[key] = [res.error]
        } else if (res.value !== undefined) {
          data[key] = res.value
        }
      }
      if (hasErrors) {
        return {
          success: false,
          error: { flatten: () => ({ fieldErrors }) },
        }
      }
      return { success: true, data }
    },
  }),
}
