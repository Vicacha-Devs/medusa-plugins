export interface ResolvedB2BCompanyTaxInfo {
  is_b2b: boolean
  company_id: string
  tax_id?: string | null
  legal_name?: string | null
  email?: string | null
}

/**
 * Optional zero-hard-dependency lookup for `@vicacha-devs/medusa-plugin-b2b`.
 * Resolves the `"company"` (or custom `b2b_module_key`) module if installed.
 */
export async function resolveOptionalB2BCompany(
  container: { resolve?: (key: string) => any } | null | undefined,
  companyId: string | null | undefined,
  b2bModuleKey = "company"
): Promise<ResolvedB2BCompanyTaxInfo | null> {
  if (!container?.resolve || !companyId) {
    return null
  }
  try {
    const b2bService = container.resolve(b2bModuleKey)
    if (!b2bService) return null
    const company =
      typeof b2bService.retrieveCompany === "function"
        ? await b2bService.retrieveCompany(companyId)
        : typeof b2bService.listCompanies === "function"
          ? (await b2bService.listCompanies({ id: companyId }))?.[0]
          : null
    if (!company) return null
    return {
      is_b2b: true,
      company_id: String(company.id || companyId),
      tax_id: company.tax_id ?? company.vat_number ?? null,
      legal_name: company.name ?? null,
      email: company.email ?? null,
    }
  } catch {
    return null
  }
}

/**
 * Optional zero-hard-dependency lookup for `@vicacha-devs/medusa-plugin-documents`.
 * Returns the latest commercial PDF document ID for an order if installed.
 */
export async function resolveOptionalDocumentsPdfId(
  container: { resolve?: (key: string) => any } | null | undefined,
  orderId: string,
  documentsModuleKey = "documentsModuleService"
): Promise<string | null> {
  if (!container?.resolve || !orderId) {
    return null
  }
  try {
    const docsService = container.resolve(documentsModuleKey)
    if (!docsService || typeof docsService.listDocuments !== "function") {
      return null
    }
    const docs = await docsService.listDocuments({ order_id: orderId })
    return docs?.[0]?.id ? String(docs[0].id) : null
  } catch {
    return null
  }
}

/**
 * Optional zero-hard-dependency lookup for `@vicacha-devs/medusa-plugin-dian`.
 * Resolves the `"dian"` module when installed for Colombia (CO) e-invoicing.
 */
export function resolveOptionalDianService(
  container: { resolve?: (key: string) => any } | null | undefined,
  dianModuleKey = "dian"
): Record<string, any> | null {
  if (!container?.resolve) {
    return null
  }
  try {
    return container.resolve(dianModuleKey) || null
  } catch {
    return null
  }
}
