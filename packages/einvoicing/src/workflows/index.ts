import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { EINVOICING_MODULE } from "../modules/einvoicing"
import type EinvoicingModuleService from "../modules/einvoicing/service"
import type { IssueFiscalDocumentInput } from "../types"

export const issueFiscalDocumentStep = createStep(
  "issue-fiscal-document",
  async (input: IssueFiscalDocumentInput, { container }) => {
    const service = container.resolve(
      EINVOICING_MODULE
    ) as EinvoicingModuleService
    const doc = await service.issueDocument(input, container)
    return new StepResponse(doc)
  }
)

export const issueFiscalDocumentWorkflow = createWorkflow(
  "issue-fiscal-document",
  (input: IssueFiscalDocumentInput) => {
    const document = issueFiscalDocumentStep(input)
    return new WorkflowResponse(document)
  }
)
