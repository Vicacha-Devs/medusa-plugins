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
  [
    "bold.read",
    "Read Bold payment methods, banks, terminals & status",
    "Bold Payments",
  ],
  [
    "bold.write",
    "Create Bold payment links, QR/POS charges & refunds",
    "Bold Payments",
  ],
] as const

export const RBAC_ROUTES: RbacRoutePolicy[] = [
  { method: "GET", path: "/admin/bold/banks", permissions: ["bold.read"] },
  {
    method: "POST",
    path: "/admin/bold/payment-button",
    permissions: ["bold.write"],
  },
  {
    method: "GET",
    path: "/admin/bold/payment-link-methods",
    permissions: ["bold.read"],
  },
  {
    method: "POST",
    path: "/admin/bold/payment-link",
    permissions: ["bold.write"],
  },
  {
    method: "GET",
    path: "/admin/bold/payment-methods",
    permissions: ["bold.read"],
  },
  {
    method: "POST",
    path: "/admin/bold/payment-qr",
    permissions: ["bold.write"],
  },
  {
    method: "GET",
    path: "/admin/bold/payment-status",
    permissions: ["bold.read"],
  },
  {
    method: "GET",
    path: "/admin/bold/payment-stream",
    permissions: ["bold.read"],
  },
  { method: "POST", path: "/admin/bold/pos-push", permissions: ["bold.write"] },
  { method: "POST", path: "/admin/bold/refund", permissions: ["bold.write"] },
  { method: "GET", path: "/admin/bold/terminals", permissions: ["bold.read"] },
]

export const rbacAccess = {
  permissions: [...RBAC_PERMISSIONS],
  routes: RBAC_ROUTES,
}
