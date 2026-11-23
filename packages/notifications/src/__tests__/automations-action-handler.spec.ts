import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { Modules } from "@medusajs/framework/utils"
import { MpnAutomationActionHandler } from "../integrations/automations-action-handler"

describe("MpnAutomationActionHandler (medusa-plugin-automations bridge)", () => {
  it("dispatches directly via Modules.NOTIFICATION when template_id is provided", async () => {
    const calls: any[] = []
    const container = {
      resolve(key: string) {
        if (key === Modules.NOTIFICATION) {
          return {
            async createNotifications(payload: any) {
              calls.push(payload)
              return { id: "notif_1" }
            },
          }
        }
        return null
      },
    }

    const handler = new MpnAutomationActionHandler()
    const res = await handler.executeAction({
      trigger: { id: "trg_1" },
      action: {
        config: {
          channel: "whatsapp",
          template_id: "system_whatsapp_order_placed",
          to: "{{customer.phone}}",
        },
      },
      context: { customer: { phone: "+573001112233" }, order_id: "ord_1" },
      container,
      eventName: "order.placed",
      contextType: "order",
    })

    assert.equal(res.success, true)
    assert.equal(calls.length, 1)
    assert.equal(calls[0].to, "+573001112233")
    assert.equal(calls[0].channel, "whatsapp")
    assert.equal(calls[0].template, "system_whatsapp_order_placed")
  })

  it("returns failure when template_id is provided but recipient cannot be resolved", async () => {
    const handler = new MpnAutomationActionHandler()
    const res = await handler.executeAction({
      trigger: { id: "trg_2" },
      action: { config: { channel: "email", template_id: "tpl_1" } },
      context: {},
      container: { resolve: () => null },
      eventName: "order.placed",
    })

    assert.equal(res.success, false)
    assert.ok(res.message?.includes("recipient"))
  })
})
