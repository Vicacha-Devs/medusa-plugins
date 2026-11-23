import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { EINVOICING_MODULE } from "../../../modules/einvoicing"
import type EinvoicingModuleService from "../../../modules/einvoicing/service"
import type { IssueFiscalDocumentInput } from "../../../types"
import { issueFiscalDocumentWorkflow } from "../../../workflows"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve(
    EINVOICING_MODULE
  ) as EinvoicingModuleService
  const documents = await service.listFiscalDocuments(
    {},
    { order: { created_at: "DESC" }, take: 50 }
  )
  res.json({ documents })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const input = req.validatedBody as IssueFiscalDocumentInput
  const { result } = await issueFiscalDocumentWorkflow(req.scope).run({ input })
  res.status(201).json({ document: result })
}
