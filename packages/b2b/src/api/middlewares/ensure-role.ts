import {
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaResponse,
} from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

function getAuthenticatedCustomerId(
  req: AuthenticatedMedusaRequest
): string | undefined {
  const actorId = req.auth_context?.actor_id
  const appCustomerId = (
    req.auth_context?.app_metadata as Record<string, unknown> | undefined
  )?.customer_id
  if (typeof actorId === "string" && actorId.length > 0) {
    return actorId
  }
  if (typeof appCustomerId === "string" && appCustomerId.length > 0) {
    return appCustomerId
  }
  return undefined
}

export const ensureCompanyMember = (options?: { requireAdmin?: boolean }) => {
  const requireAdmin = options?.requireAdmin ?? false
  return async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    const customerId = getAuthenticatedCustomerId(req)
    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const companyId = req.params?.id
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" })
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [company],
    } = await query.graph({
      entity: "companies",
      fields: [
        "id",
        "employees.id",
        "employees.is_admin",
        "employees.customer.id",
      ],
      filters: { id: companyId },
    })

    if (!company) {
      return res.status(404).json({ message: "Company not found" })
    }

    const employees = (company.employees ?? []) as Array<{
      id: string
      is_admin?: boolean
      customer?: { id?: string } | null
    }>

    const matchingEmployee = employees.find(
      (emp) => emp.customer?.id === customerId
    )

    if (!matchingEmployee) {
      return res.status(403).json({ message: "Forbidden" })
    }

    if (requireAdmin && !matchingEmployee.is_admin) {
      return res.status(403).json({ message: "Forbidden" })
    }

    return next()
  }
}

export const ensureRole = (role: string) => {
  return async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    const customerId = getAuthenticatedCustomerId(req)
    const authIdentityId = req.auth_context?.auth_identity_id
    if (!customerId || !authIdentityId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    if (req.params?.id) {
      const {
        data: [company],
      } = await query.graph({
        entity: "companies",
        fields: [
          "id",
          "employees.id",
          "employees.is_admin",
          "employees.customer.id",
        ],
        filters: { id: req.params.id },
      })

      if (company) {
        const employees = (company.employees ?? []) as Array<{
          id: string
          is_admin?: boolean
          customer?: { id?: string } | null
        }>
        const member = employees.find((emp) => emp.customer?.id === customerId)
        if (!member || (role === "company_admin" && !member.is_admin)) {
          return res.status(403).json({ message: "Forbidden" })
        }
        return next()
      }
    }

    const {
      data: [providerIdentity],
    } = await query.graph({
      entity: "provider_identity",
      fields: ["id", "user_metadata"],
      filters: { auth_identity_id: authIdentityId } as any,
    })

    if (providerIdentity?.user_metadata?.role === role) {
      return next()
    }

    return res.status(403).json({ message: "Forbidden" })
  }
}
