// Auto-generated RBAC descriptors compatible with @abhi1693/medusa-rbac AccessControlOptions.
export type RbacPermissionTuple = readonly [
  id: string,
  label: string,
  group: string,
]
export type RbacRoutePolicy = {
  method: string
  path: string
  permissions: string[]
  superuser?: boolean
}

export const RBAC_PERMISSIONS: readonly RbacPermissionTuple[] = [
  ["b2b.read", "Read B2B companies, employees, quotes & approvals", "B2B"],
  ["b2b.write", "Manage B2B companies, employees, quotes & approvals", "B2B"],
] as const

export const RBAC_ROUTES: RbacRoutePolicy[] = [
  {
    method: "POST",
    path: "/admin/b2b/approvals/:id",
    permissions: ["b2b.write"],
  },
  { method: "GET", path: "/admin/b2b/approvals", permissions: ["b2b.read"] },
  {
    method: "GET",
    path: "/admin/b2b/companies/:id/approval-settings",
    permissions: ["b2b.read"],
  },
  {
    method: "POST",
    path: "/admin/b2b/companies/:id/approval-settings",
    permissions: ["b2b.write"],
  },
  {
    method: "DELETE",
    path: "/admin/b2b/companies/:id/customer-group/:customerGroupId",
    permissions: ["b2b.write"],
  },
  {
    method: "POST",
    path: "/admin/b2b/companies/:id/customer-group",
    permissions: ["b2b.write"],
  },
  {
    method: "GET",
    path: "/admin/b2b/companies/:id/employees/:employeeId",
    permissions: ["b2b.read"],
  },
  {
    method: "POST",
    path: "/admin/b2b/companies/:id/employees/:employeeId",
    permissions: ["b2b.write"],
  },
  {
    method: "DELETE",
    path: "/admin/b2b/companies/:id/employees/:employeeId",
    permissions: ["b2b.write"],
  },
  {
    method: "GET",
    path: "/admin/b2b/companies/:id/employees",
    permissions: ["b2b.read"],
  },
  {
    method: "POST",
    path: "/admin/b2b/companies/:id/employees",
    permissions: ["b2b.write"],
  },
  {
    method: "GET",
    path: "/admin/b2b/companies/:id",
    permissions: ["b2b.read"],
  },
  {
    method: "POST",
    path: "/admin/b2b/companies/:id",
    permissions: ["b2b.write"],
  },
  {
    method: "DELETE",
    path: "/admin/b2b/companies/:id",
    permissions: ["b2b.write"],
  },
  { method: "GET", path: "/admin/b2b/companies", permissions: ["b2b.read"] },
  { method: "POST", path: "/admin/b2b/companies", permissions: ["b2b.write"] },
  {
    method: "GET",
    path: "/admin/b2b/customers/:id/employee",
    permissions: ["b2b.read"],
  },
  {
    method: "POST",
    path: "/admin/b2b/quotes/:id/messages",
    permissions: ["b2b.write"],
  },
  {
    method: "POST",
    path: "/admin/b2b/quotes/:id/reject",
    permissions: ["b2b.write"],
  },
  { method: "GET", path: "/admin/b2b/quotes/:id", permissions: ["b2b.read"] },
  {
    method: "POST",
    path: "/admin/b2b/quotes/:id/send",
    permissions: ["b2b.write"],
  },
  { method: "GET", path: "/admin/b2b/quotes", permissions: ["b2b.read"] },
  { method: "GET", path: "/admin/companies", permissions: ["b2b.read"] },
  {
    method: "GET",
    path: "/admin/views/b2b-approvals/columns",
    permissions: ["b2b.read"],
  },
  {
    method: "GET",
    path: "/admin/views/b2b-companies/columns",
    permissions: ["b2b.read"],
  },
  {
    method: "GET",
    path: "/admin/views/b2b-company-employees/columns",
    permissions: ["b2b.read"],
  },
  {
    method: "GET",
    path: "/admin/views/b2b-quotes/columns",
    permissions: ["b2b.read"],
  },
]

export const rbacAccess = {
  permissions: [...RBAC_PERMISSIONS],
  routes: RBAC_ROUTES,
}
