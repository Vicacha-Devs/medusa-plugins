import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { Modules } from "@medusajs/framework/utils"
import {
  MedusaNotificationActionHandler,
  WebhookActionHandler,
} from "../modules/automations/actions/built-in-handlers"
import {
  evaluateConditions,
  resolveContextPath,
} from "../modules/automations/utils/rule-evaluator"

describe("@vicacha-devs/medusa-plugin-automations", () => {
  it("resolves nested paths safely and blocks prototype traversal", () => {
    const ctx = {
      order: { total: 250, currency_code: "usd", items: [{ sku: "SKU-1" }] },
    }
    assert.equal(resolveContextPath(ctx, "order.total"), 250)
    assert.equal(resolveContextPath(ctx, "order.items.0.sku"), "SKU-1")
    assert.equal(resolveContextPath(ctx, "order.__proto__"), undefined)
    assert.equal(resolveContextPath(ctx, "constructor.prototype"), undefined)
  })

  it("evaluates multi-condition rules across numeric, string, and array operators", () => {
    const ctx = {
      order: { total: 150, currency_code: "USD" },
      customer: { email: "vip@example.com", tags: ["vip", "b2b"] },
    }
    assert.equal(
      evaluateConditions(
        [
          { field: "order.total", operator: "gte", value: 100 },
          {
            field: "order.currency_code",
            operator: "in",
            value: ["USD", "EUR"],
          },
          { field: "customer.tags", operator: "contains", value: "vip" },
          { field: "customer.email", operator: "exists" },
        ],
        ctx
      ),
      true
    )

    assert.equal(
      evaluateConditions(
        [{ field: "order.total", operator: "lt", value: 100 }],
        ctx
      ),
      false
    )
  })

  it("dispatches notifications via Modules.NOTIFICATION in MedusaNotificationActionHandler", async () => {
    const dispatched: any[] = []
    const container = {
      resolve(key: string) {
        if (key === Modules.NOTIFICATION) {
          return {
            async createNotifications(payload: any) {
              dispatched.push(payload)
              return { id: "notif_auto_1" }
            },
          }
        }
        return null
      },
    }

    const handler = new MedusaNotificationActionHandler()
    const res = await handler.executeAction({
      trigger: { type: "event", event_name: "order.placed" },
      action: {
        type: "notification",
        config: {
          channel: "email",
          template: "order-vip",
          to: "{{customer.email}}",
        },
      },
      context: { customer: { email: "buyer@example.com" }, total: 500 },
      container,
      eventName: "order.placed",
    })

    assert.equal(res.success, true)
    assert.equal(dispatched.length, 1)
    assert.equal(dispatched[0].to, "buyer@example.com")
    assert.equal(dispatched[0].template, "order-vip")
  })

  it("blocks unsafe non-HTTPS webhook URLs in production", async () => {
    const prevEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "production"
    try {
      const handler = new WebhookActionHandler()
      const res = await handler.executeAction({
        trigger: { type: "manual" },
        action: {
          type: "webhook",
          config: { url: "http://169.254.169.254/latest/meta-data" },
        },
        context: {},
        container: {},
        eventName: "manual.trigger",
      })
      assert.equal(res.success, false)
    } finally {
      process.env.NODE_ENV = prevEnv
    }
  })
})
