import { MedusaError } from "@medusajs/framework/utils"

const EINVOICING_MODULE = "einvoicing"

/**
 * Ensures `@vicacha-devs/medusa-plugin-einvoicing` is registered in the
 * Medusa container. `@vicacha-devs/medusa-plugin-dian` acts as a Colombia
 * (CO) fiscal driver for `einvoicing` and cannot run without it.
 */
export function assertEinvoicingInstalled(
  container: { resolve?: (key: string) => any } | null | undefined
): Record<string, any> {
  if (!container?.resolve) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "@vicacha-devs/medusa-plugin-dian requires @vicacha-devs/medusa-plugin-einvoicing to be registered in medusa-config.ts."
    )
  }
  try {
    const service = container.resolve(EINVOICING_MODULE)
    if (!service) {
      throw new Error("Empty einvoicing service")
    }
    return service
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "@vicacha-devs/medusa-plugin-dian requires @vicacha-devs/medusa-plugin-einvoicing to be registered in medusa-config.ts."
    )
  }
}
