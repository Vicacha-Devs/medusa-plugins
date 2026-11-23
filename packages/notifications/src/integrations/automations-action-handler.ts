import { Modules } from "@medusajs/framework/utils"

export interface AutomationActionHandlerParams {
  trigger: Record<string, any>
  action: Record<string, any>
  context: Record<string, any>
  container: any
  eventName: string
  contextType?: string | null
}

export interface AutomationActionHandlerResult {
  success: boolean
  message?: string
  data?: unknown
}

function resolvePathValue(
  source: Record<string, any>,
  rawValue: unknown
): string {
  if (typeof rawValue !== "string" || !rawValue.trim()) {
    return String(
      source?.email ||
        source?.customer?.email ||
        source?.order?.email ||
        source?.phone ||
        source?.customer?.phone ||
        ""
    ).trim()
  }

  const trimmed = rawValue.trim()
  const match = /^\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}$/.exec(trimmed)
  if (!match) {
    return trimmed
  }

  let current: any = source
  for (const segment of match[1].split(".")) {
    if (
      segment === "__proto__" ||
      segment === "constructor" ||
      segment === "prototype"
    ) {
      return ""
    }
    if (current == null || typeof current !== "object") {
      return ""
    }
    current = current[segment]
  }
  return current != null ? String(current).trim() : ""
}

/**
 * Custom ActionHandler bridge for `@codee-sh/medusa-plugin-automations` that
 * dispatches multi-channel notifications (Email, WhatsApp, Telegram, SMS,
 * Slack, Sandbox) through `@vicacha-devs/medusa-plugin-notifications`.
 */
export class MpnAutomationActionHandler {
  id = "mpn-notification-studio"
  label = "Notification Studio (Multi-Channel)"
  description =
    "Dispatch Email, WhatsApp, Telegram, SMS, or Slack via @vicacha-devs/medusa-plugin-notifications"
  enabled = true

  fields = [
    {
      name: "channel",
      key: "channel",
      label: "Channel",
      type: "select" as const,
      required: false,
      defaultValue: "email",
      options: [
        { value: "email", name: "Email" },
        { value: "whatsapp", name: "WhatsApp" },
        { value: "telegram", name: "Telegram" },
        { value: "sms", name: "SMS" },
        { value: "slack", name: "Slack" },
      ],
    },
    {
      name: "template_id",
      key: "template_id",
      label: "Template ID (leave empty to use Event Mappings)",
      type: "text" as const,
      required: false,
    },
    {
      name: "to",
      key: "to",
      label: "Recipient (or {{customer.email}})",
      type: "text" as const,
      required: false,
    },
  ]

  async executeAction({
    action,
    context,
    container,
    eventName,
    contextType,
  }: AutomationActionHandlerParams): Promise<AutomationActionHandlerResult> {
    const config = action?.config || action || {}
    const templateId = String(
      config.template_id || config.templateName || ""
    ).trim()

    if (!templateId) {
      const { executeEventNotificationsDispatch } =
        await import("../workflows/index.js")
      const dispatchResult = await executeEventNotificationsDispatch(
        container,
        {
          event_name: eventName,
          event_data: context || {},
        }
      )
      return {
        success: true,
        message: `Dispatched Notification Studio mappings for ${eventName}`,
        data: dispatchResult,
      }
    }

    const channel = String(config.channel || "email").trim()
    const to = resolvePathValue(context || {}, config.to)
    if (!to) {
      return {
        success: false,
        message: "Notification recipient could not be resolved",
      }
    }

    const notificationService = container.resolve(Modules.NOTIFICATION)
    const result = await notificationService.createNotifications({
      to,
      channel,
      template: templateId,
      data: {
        ...context,
        event_name: eventName,
        context_type: contextType,
      },
    })

    return {
      success: true,
      message: `Notification dispatched via ${channel}`,
      data: result,
    }
  }
}
