import {
  MiddlewareRoute,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework"
import { authenticate } from "@medusajs/medusa"
import {
  ensureCompanyMember,
  ensureRole,
} from "@b2b/api/middlewares/ensure-role"
import {
  storeCompanyQueryConfig,
  storeEmployeeQueryConfig,
} from "./query-config"
import {
  StoreCreateCompany,
  StoreCreateEmployee,
  StoreGetCompanyParams,
  StoreGetEmployeeParams,
  StoreUpdateApprovalSettings,
  StoreUpdateCompany,
  StoreUpdateEmployee,
} from "./validators"

export const storeCompaniesMiddlewares: MiddlewareRoute[] = [
  /* Company middlewares */
  {
    method: "ALL",
    matcher: "/store/b2b/companies*",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
  {
    method: ["GET"],
    matcher: "/store/b2b/companies",
    middlewares: [
      validateAndTransformQuery(
        StoreGetCompanyParams,
        storeCompanyQueryConfig.list
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/b2b/companies",
    middlewares: [
      validateAndTransformBody(StoreCreateCompany),
      validateAndTransformQuery(
        StoreGetCompanyParams,
        storeCompanyQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/b2b/companies/:id",
    middlewares: [
      ensureCompanyMember(),
      validateAndTransformQuery(
        StoreGetCompanyParams,
        storeCompanyQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/b2b/companies/:id",
    middlewares: [
      ensureCompanyMember({ requireAdmin: true }),
      validateAndTransformBody(StoreUpdateCompany),
      validateAndTransformQuery(
        StoreGetCompanyParams,
        storeCompanyQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["DELETE"],
    matcher: "/store/b2b/companies/:id",
    middlewares: [ensureCompanyMember({ requireAdmin: true })],
  },

  /* Employee middlewares */
  {
    method: ["GET"],
    matcher: "/store/b2b/companies/:id/employees",
    middlewares: [
      ensureCompanyMember(),
      validateAndTransformQuery(
        StoreGetEmployeeParams,
        storeEmployeeQueryConfig.list
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/b2b/companies/:id/employees",
    middlewares: [
      ensureRole("company_admin"),
      validateAndTransformBody(StoreCreateEmployee),
      validateAndTransformQuery(
        StoreGetEmployeeParams,
        storeEmployeeQueryConfig.list
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/b2b/companies/:id/employees/:employee_id",
    middlewares: [
      ensureCompanyMember(),
      validateAndTransformQuery(
        StoreGetEmployeeParams,
        storeEmployeeQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/b2b/companies/:id/employees/:employee_id",
    middlewares: [
      ensureRole("company_admin"),
      validateAndTransformBody(StoreUpdateEmployee),
      validateAndTransformQuery(
        StoreGetEmployeeParams,
        storeEmployeeQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/b2b/companies/:id/approval-settings",
    middlewares: [
      ensureRole("company_admin"),
      validateAndTransformBody(StoreUpdateApprovalSettings),
    ],
  },
]
