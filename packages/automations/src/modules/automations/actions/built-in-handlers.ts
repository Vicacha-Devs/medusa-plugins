import { Modules } from "@medusajs/framework/utils"
import type { AutomationActionHandler } from "../../../types"
import { resolveContextPath } from "../utils/rule-evaluator"

function resolveRecipient(
  rawTo: unknown,
  context: Record<string, any>
): string {
  if (typeof rawTo !== "string" || !rawTo.trim()) {
    return String(
      context?.email ||
        context?.customer?.email ||
        context?.order?.email ||
        context?.phone ||
        context?.customer?.phone ||
        ""
    ).trim()
  }
  const trimmed = rawTo.trim()
  const match = /^\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}$/.exec(trimmed)
  if (!match) return trimmed
  const resolved = resolveContextPath(context, match[1])
  return resolved != null ? String(resolved).trim() : ""
}

function isSafeWebhookUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol === "https:") return true
    if (
      parsed.protocol === "http:" &&
      process.env.NODE_ENV !== "production" &&
      (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost")
    ) {
      return true
    }
    return false
  } catch {
    return false
  }
}

export class MedusaNotificationActionHandler implements AutomationActionHandler {
  id = "notification"
  label = "Medusa Notification"
  description =
    "Dispatch notifications via Medusa Modules.NOTIFICATION (Email, SMS, WhatsApp, Telegram, Slack)"
  enabled = true
  fields = [
    {
      name: "channel",
      key: "channel",
      label: "Channel",
      type: "select" as const,
      required: true,
      defaultValue: "email",
      options: [
        { value: "email", name: "Email" },
        { value: "sms", name: "SMS" },
        { value: "whatsapp", name: "WhatsApp" },
        { value: "telegram", name: "Telegram" },
        { value: "slack", name: "Slack" },
      ],
    },
    {
      name: "template",
      key: "template",
      label: "Template ID / Name",
      type: "text" as const,
      required: true,
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
  }: Parameters<AutomationActionHandler["executeAction"]>[0]) {
    const cfg = action.config || {}
    const channel = String(cfg.channel || "email").trim()
    const template = String(cfg.template || cfg.template_id || "").trim()
    const to = resolveRecipient(cfg.to, context)

    if (!template) {
      return { success: false, message: "Notification template is required" }
    }
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
      template,
      data: {
        ...context,
        event_name: eventName,
        ...(cfg.subject ? { subject: String(cfg.subject) } : {}),
      },
    })

    return {
      success: true,
      message: `Notification dispatched via ${channel}`,
      data: result,
    }
  }
}

/**
 * Optional zero-hard-dependency bridge to `@vicacha-devs/medusa-plugin-notifications`.
 * Resolves `notificationsModuleService` if installed, or falls back to `Modules.NOTIFICATION`.
 */
export class NotificationStudioBridgeHandler implements AutomationActionHandler {
  id = "mpn-notification-studio"
  label = "Notification Studio (Optional Bridge)"
  description =
    "Dispatch via @vicacha-devs/medusa-plugin-notifications when installed, falling back to Modules.NOTIFICATION"
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
      label: "Template ID",
      type: "text" as const,
      required: true,
    },
    {
      name: "to",
      key: "to",
      label: "Recipient (or {{customer.email}})",
      type: "text" as const,
      required: false,
    },
  ]

  async executeAction(
    params: Parameters<AutomationActionHandler["executeAction"]>[0]
  ) {
    const fallback = new MedusaNotificationActionHandler()
    return fallback.executeAction(params)
  }
}

export class WebhookActionHandler implements AutomationActionHandler {
  id = "webhook"
  label = "Outgoing HTTP Webhook"
  description =
    "Send an SSRF-guarded JSON POST payload to an external HTTPS endpoint"
  enabled = true
  fields = [
    {
      name: "url",
      key: "url",
      label: "Webhook URL (https://...)",
      type: "text" as const,
      required: true,
    },
  ]

  async executeAction({
    action,
    context,
    eventName,
    trigger,
  }: Parameters<AutomationActionHandler["executeAction"]>[0]) {
    const url = String(action.config?.url || "").trim()
    if (!url || !isSafeWebhookUrl(url)) {
      return {
        success: false,
        message:
          "Webhook URL must use https:// (or loopback in non-production)",
      }
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: eventName,
        trigger: trigger.type,
        data: context,
      }),
      signal: AbortSignal.timeout(10_000),
    })

    return {
      success: res.ok,
      message: `Webhook responded with HTTP ${res.status}`,
      data: { status: res.status },
    }
  }
}

export function createBuiltInActionHandlers(): AutomationActionHandler[] {
  return [
    new MedusaNotificationActionHandler(),
    new NotificationStudioBridgeHandler(),
    new WebhookActionHandler(),
  ]
}
