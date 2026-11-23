import { MedusaError, Modules } from "@medusajs/framework/utils"
import { validateSafeExternalUrl } from "./docuseal"

export interface BrandedSignatureInviteParams {
  signerEmail: string
  signerName: string
  role: string
  signingUrl: string
  allowedDocusealBaseUrl?: string | null
  documentId: string
  documentNumber: string
  documentType: string
  orderId?: string | null
  companyName: string
  companyLogo?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  footerText?: string | null
  locale?: string | null
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function sanitizeHeaderLine(value: unknown, maxLen = 180): string {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, maxLen)
}

function sanitizeHexColor(
  raw: string | null | undefined,
  fallback: string
): string {
  const cleaned = String(raw ?? "").trim()
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(cleaned)
    ? cleaned
    : fallback
}

function sanitizeLogoUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string" || !raw.trim()) return null
  try {
    const parsed = validateSafeExternalUrl(raw.trim())
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Builds a branded HTML + plain-text e-signature invitation email using store colors & logo,
 * allowing self-hosted DocuSeal OSS instances to send `send_email: false` and deliver
 * white-labeled invites through Medusa `Modules.NOTIFICATION` (e.g. Resend API / SMTP).
 */
export function buildBrandedSignatureInviteEmail(
  params: BrandedSignatureInviteParams
): { subject: string; text: string; html: string; signingUrl: string } {
  const validatedSigningUrl = validateSafeExternalUrl(
    params.signingUrl,
    params.allowedDocusealBaseUrl
  )
  if (params.allowedDocusealBaseUrl) {
    let allowedOrigin = ""
    try {
      allowedOrigin = new URL(params.allowedDocusealBaseUrl).origin
    } catch {
      allowedOrigin = ""
    }
    const host = validatedSigningUrl.hostname.toLowerCase()
    if (
      allowedOrigin &&
      validatedSigningUrl.origin !== allowedOrigin &&
      host !== "docuseal.com" &&
      !host.endsWith(".docuseal.com") &&
      host !== "docuseal.eu" &&
      !host.endsWith(".docuseal.eu")
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Signing URL origin does not match configured DocuSeal host"
      )
    }
  }

  const signingUrl = validatedSigningUrl.toString()
  const isSpanish = String(params.locale || "es")
    .toLowerCase()
    .startsWith("es")
  const primary = sanitizeHexColor(params.primaryColor, "#18181b")
  const secondary = sanitizeHexColor(params.secondaryColor, "#52525b")
  const safeLogo = sanitizeLogoUrl(params.companyLogo)

  const docLabel = `${params.documentType.replace(/_/g, " ").toUpperCase()} ${params.documentNumber}`
  const subject = sanitizeHeaderLine(
    isSpanish
      ? `Firma requerida: ${docLabel} — ${params.companyName}`
      : `Signature required: ${docLabel} — ${params.companyName}`
  )

  const greeting = isSpanish
    ? `Hola, ${params.signerName}`
    : `Hello, ${params.signerName}`
  const intro = isSpanish
    ? `Te solicitamos tu firma electrónica en calidad de ${params.role} para el siguiente documento:`
    : `You are requested to electronically sign the following document as ${params.role}:`
  const ctaLabel = isSpanish
    ? "Revisar y Firmar Documento"
    : "Review & Sign Document"
  const fallbackHint = isSpanish
    ? "Si el botón no funciona, copia y abre este enlace en tu navegador:"
    : "If the button does not work, copy and open this link in your browser:"
  const docFieldLabel = isSpanish ? "Documento" : "Document"
  const roleFieldLabel = isSpanish ? "Rol" : "Role"

  const text = [
    params.companyName,
    "",
    greeting,
    "",
    `${intro} ${docLabel}.`,
    "",
    `${ctaLabel}: ${signingUrl}`,
    "",
    params.footerText || params.companyName,
  ].join("\n")

  const safeHref = escapeHtml(signingUrl)
  const logoMarkup = safeLogo
    ? `<img src="${escapeHtml(safeLogo)}" alt="${escapeHtml(params.companyName)}" style="max-height:44px;max-width:200px;margin-bottom:10px;display:block" />`
    : ""

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:28px;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:10px;line-height:1.6;color:#18181b">
  <div style="border-bottom:3px solid ${primary};padding-bottom:16px;margin-bottom:20px">
    ${logoMarkup}
    <h1 style="margin:0;font-size:20px;color:${primary}">${escapeHtml(params.companyName)}</h1>
  </div>
  <h2 style="margin:0 0 12px;font-size:17px;color:#18181b">${escapeHtml(greeting)}</h2>
  <p style="margin:0 0 16px">${escapeHtml(intro)}</p>
  <div style="background-color:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:14px 16px;margin:0 0 22px">
    <p style="margin:0 0 6px"><strong>${docFieldLabel}:</strong> ${escapeHtml(docLabel)}</p>
    <p style="margin:0"><strong>${roleFieldLabel}:</strong> ${escapeHtml(params.role)}</p>
  </div>
  <p style="text-align:center;margin:24px 0">
    <a href="${safeHref}" style="display:inline-block;background-color:${primary};color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 26px;border-radius:6px">${escapeHtml(ctaLabel)}</a>
  </p>
  <p style="font-size:12px;color:${secondary};word-break:break-all">${escapeHtml(fallbackHint)}<br />${safeHref}</p>
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:22px 0" />
  <p style="font-size:12px;color:${secondary};margin:0">${escapeHtml(params.footerText || params.companyName)}</p>
</div>`

  return { subject, text, html, signingUrl }
}

/**
 * Dispatches a branded e-signature invitation through Medusa `Modules.NOTIFICATION`
 * using `template: "document-signature-request"` with pre-rendered branded HTML/text.
 */
export async function sendSignatureRequestEmailNotification(
  container: { resolve: (key: string) => any },
  params: BrandedSignatureInviteParams
): Promise<{ sent: boolean; recipient: string }> {
  const recipient = sanitizeHeaderLine(params.signerEmail, 180)
  if (!recipient || !recipient.includes("@")) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Invalid signer email address"
    )
  }

  const notificationService = container.resolve(Modules.NOTIFICATION) as any
  if (
    !notificationService ||
    typeof notificationService.createNotifications !== "function"
  ) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Medusa Notification Module is not available"
    )
  }

  const email = buildBrandedSignatureInviteEmail(params)

  await notificationService.createNotifications({
    to: recipient,
    channel: "email",
    template: "document-signature-request",
    content: {
      subject: email.subject,
      html: email.html,
      text: email.text,
    },
    data: {
      subject: email.subject,
      html: email.html,
      text: email.text,
      signing_url: email.signingUrl,
      signer_name: params.signerName,
      signer_email: recipient,
      role: params.role,
      document_id: params.documentId,
      document_number: params.documentNumber,
      document_type: params.documentType,
      order_id: params.orderId ?? null,
      company_name: params.companyName,
      company_logo: sanitizeLogoUrl(params.companyLogo),
      primary_color: sanitizeHexColor(params.primaryColor, "#18181b"),
      secondary_color: sanitizeHexColor(params.secondaryColor, "#52525b"),
    },
  })

  return { sent: true, recipient }
}
