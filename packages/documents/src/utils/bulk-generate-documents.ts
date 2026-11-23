import type { BulkGenerateInput, BulkGenerateSummary } from "../types"
import { generateDocumentWorkflow } from "../workflows/generate-document"

export type {
  BulkGenerateInput,
  BulkGenerateItemResult,
  BulkGenerateSummary,
} from "../types"

/**
 * Executes bulk document generation across an array of `order_ids` (Phase 7.1).
 */
export async function executeBulkDocumentGeneration(
  container: any,
  input: BulkGenerateInput
): Promise<BulkGenerateSummary> {
  const uniqueOrderIds = Array.from(
    new Set((input.order_ids || []).map((id) => id.trim()).filter(Boolean))
  )

  const summary: BulkGenerateSummary = {
    total: uniqueOrderIds.length,
    generated: 0,
    skipped: 0,
    failed: 0,
    results: [],
  }

  const CONCURRENCY = 5
  for (let i = 0; i < uniqueOrderIds.length; i += CONCURRENCY) {
    const chunk = uniqueOrderIds.slice(i, i + CONCURRENCY)
    const chunkResults = await Promise.all(
      chunk.map(async (orderId) => {
        try {
          const { result } = await generateDocumentWorkflow(container).run({
            input: {
              order_id: orderId,
              document_type: input.document_type ?? "invoice",
              template_id: input.template_id ?? null,
              locale: input.locale ?? null,
              force_new_version: input.force_new_version ?? false,
              actor_id: input.actor_id ?? null,
            },
          })

          if (result.was_created) {
            return {
              order_id: orderId,
              status: "generated" as const,
              document_id: result.document?.id,
              document_number: result.document?.document_number,
            }
          }
          return {
            order_id: orderId,
            status: "skipped" as const,
            document_id: result.document?.id,
            document_number: result.document?.document_number,
          }
        } catch (err: unknown) {
          return {
            order_id: orderId,
            status: "failed" as const,
            error: err instanceof Error ? err.message : String(err),
          }
        }
      })
    )

    for (const item of chunkResults) {
      if (item.status === "generated") summary.generated++
      else if (item.status === "skipped") summary.skipped++
      else summary.failed++
      summary.results.push(item)
    }
  }

  return summary
}
