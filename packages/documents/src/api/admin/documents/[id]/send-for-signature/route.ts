import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DOCUMENTS_MODULE } from "../../../../../modules/documents/types"
import DocumentsModuleService from "../../../../../modules/documents/service"
import { sendSignatureRequestEmailNotification } from "../../../../../modules/documents/services/signature-email"
import { createSignatureRequestWorkflow } from "../../../../../workflows/create-signature-request"
import { SendForSignatureSchema } from "../../../../validators"

/**
 * POST /admin/documents/:id/send-for-signature
 * Sends any generated document (invoice, packing_slip, credit_note) to Docuseal
 * using zero-config direct PDF upload (`/submissions/pdf`) or an optional `template_id`.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const parsed = SendForSignatureSchema.safeParse(req.body || {})
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid signature request payload",
      errors: parsed.error.flatten().fieldErrors,
    })
  }

  const documentsService =
    req.scope.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)

  if (!documentsService.docuseal.isConfigured()) {
    return res.status(400).json({
      message:
        "Docuseal e-signature integration is not configured. Add docuseal.api_key in plugin options or DOCUSEAL_API_KEY.",
    })
  }

  try {
    const { buffer, document } =
      await documentsService.getDocumentPdfBuffer(id)
    const settings = await documentsService.resolveSettings(
      document.settings_snapshot?.region_id
    )

    const orderSnapshot = document.render_context_snapshot?.order || {}
    const b2bSnapshot = document.render_context_snapshot?.b2b || {}

    const signerEmail =
      parsed.data.signer_email ||
      b2bSnapshot.buyer_contact_email ||
      orderSnapshot.email ||
      orderSnapshot.customer?.email

    if (!signerEmail) {
      return res.status(400).json({
        message:
          "No signer_email provided and no customer email was found on the order",
      })
    }

    const signerName =
      parsed.data.signer_name ||
      b2bSnapshot.buyer_contact_name ||
      [
        orderSnapshot.customer?.first_name,
        orderSnapshot.customer?.last_name,
      ]
        .filter(Boolean)
        .join(" ") ||
      b2bSnapshot.company_name ||
      signerEmail

    const templateId =
      parsed.data.template_id ?? settings.docuseal_template_id ?? null
    const role =
      parsed.data.role || settings.signature_role || "Customer"

    const emailDeliveryMode =
      parsed.data.email_delivery ??
      documentsService.docuseal.getEmailDeliveryMode()
    const shouldDispatchBrandedEmail =
      parsed.data.send_email !== false && emailDeliveryMode === "medusa"
    const docusealSendEmail =
      parsed.data.send_email !== false && emailDeliveryMode === "docuseal"

    const submission = await documentsService.docuseal.createSubmission({
      documentName: `${document.document_type.toUpperCase()} ${document.document_number}`,
      pdfBuffer: buffer,
      templateId,
      submitter: {
        email: signerEmail,
        name: signerName,
        role,
        send_email: docusealSendEmail,
      },
      metadata: {
        document_id: document.id,
        document_number: document.document_number,
        order_id: document.order_id,
      },
    })

    let brandedEmailDispatched = false
    if (shouldDispatchBrandedEmail && submission.embed_src) {
      await sendSignatureRequestEmailNotification(req.scope, {
        signerEmail,
        signerName,
        role,
        signingUrl: submission.embed_src,
        allowedDocusealBaseUrl: documentsService.docuseal.getBaseUrl(),
        documentId: document.id,
        documentNumber: document.document_number,
        documentType: document.document_type,
        orderId: document.order_id,
        companyName:
          document.settings_snapshot?.company_name ||
          settings.company_name ||
          "Store",
        companyLogo:
          document.settings_snapshot?.company_logo ??
          settings.company_logo ??
          null,
        primaryColor:
          document.settings_snapshot?.primary_color ??
          settings.primary_color ??
          null,
        secondaryColor:
          document.settings_snapshot?.secondary_color ??
          settings.secondary_color ??
          null,
        footerText:
          document.settings_snapshot?.footer_text ??
          settings.footer_text ??
          null,
        locale:
          document.settings_snapshot?.locale ?? settings.default_locale ?? "es",
      })
      brandedEmailDispatched = true
    }

    const actorId = (req as any).auth_context?.actor_id ?? null
    const { result: signatureRequest } = await createSignatureRequestWorkflow(
      req.scope
    ).run({
      input: {
        document_id: document.id,
        actor_id: actorId,
        data: {
          document_id: document.id,
          order_id: document.order_id,
          docuseal_submission_id: submission.submission_id,
          docuseal_submitter_id: submission.submitter_id,
          signer_email: signerEmail,
          signer_name: signerName,
          embed_src: submission.embed_src,
          status: brandedEmailDispatched ? "sent" : submission.status,
          sent_at: new Date(),
        },
        audit_details: {
          docuseal_submission_id: submission.submission_id,
          signer_email: signerEmail,
          email_delivery: emailDeliveryMode,
          branded_email_dispatched: brandedEmailDispatched,
        },
      },
    })

    return res.status(201).json({
      signature_request: signatureRequest,
      email_delivery: emailDeliveryMode,
      branded_email_dispatched: brandedEmailDispatched,
    })
  } catch (err: any) {
    return res.status(500).json({
      message:
        err instanceof Error
          ? err.message
          : "Failed to create Docuseal signature submission",
    })
  }
}
