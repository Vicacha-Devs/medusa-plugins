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
    "barcodes.read",
    "Read barcodes, tags, templates & count sessions",
    "Barcodes",
  ],
  [
    "barcodes.write",
    "Manage barcodes, tags, templates, printing & count sessions",
    "Barcodes",
  ],
] as const

export const RBAC_ROUTES: RbacRoutePolicy[] = [
  {
    method: "GET",
    path: "/admin/barcodes/:barcode",
    permissions: ["barcodes.read"],
  },
  {
    method: "DELETE",
    path: "/admin/barcodes/:barcode",
    permissions: ["barcodes.write"],
  },
  {
    method: "POST",
    path: "/admin/barcodes/batch",
    permissions: ["barcodes.write"],
  },
  {
    method: "POST",
    path: "/admin/barcodes/bulk-generate",
    permissions: ["barcodes.write"],
  },
  {
    method: "GET",
    path: "/admin/barcodes/cache",
    permissions: ["barcodes.read"],
  },
  {
    method: "DELETE",
    path: "/admin/barcodes/cache",
    permissions: ["barcodes.write"],
  },
  {
    method: "POST",
    path: "/admin/barcodes/count-sessions/:id/apply",
    permissions: ["barcodes.write"],
  },
  {
    method: "POST",
    path: "/admin/barcodes/count-sessions/:id/scan",
    permissions: ["barcodes.write"],
  },
  {
    method: "GET",
    path: "/admin/barcodes/count-sessions",
    permissions: ["barcodes.read"],
  },
  {
    method: "POST",
    path: "/admin/barcodes/count-sessions",
    permissions: ["barcodes.write"],
  },
  {
    method: "POST",
    path: "/admin/barcodes/create-from-barcode",
    permissions: ["barcodes.write"],
  },
  {
    method: "POST",
    path: "/admin/barcodes/lookup",
    permissions: ["barcodes.write"],
  },
  {
    method: "POST",
    path: "/admin/barcodes/print",
    permissions: ["barcodes.write"],
  },
  { method: "GET", path: "/admin/barcodes", permissions: ["barcodes.read"] },
  {
    method: "POST",
    path: "/admin/barcodes/scan",
    permissions: ["barcodes.write"],
  },
  {
    method: "GET",
    path: "/admin/barcodes/tags/:id",
    permissions: ["barcodes.read"],
  },
  {
    method: "PATCH",
    path: "/admin/barcodes/tags/:id",
    permissions: ["barcodes.write"],
  },
  {
    method: "DELETE",
    path: "/admin/barcodes/tags/:id",
    permissions: ["barcodes.write"],
  },
  {
    method: "GET",
    path: "/admin/barcodes/tags",
    permissions: ["barcodes.read"],
  },
  {
    method: "POST",
    path: "/admin/barcodes/tags",
    permissions: ["barcodes.write"],
  },
  {
    method: "GET",
    path: "/admin/barcodes/templates",
    permissions: ["barcodes.read"],
  },
  {
    method: "POST",
    path: "/admin/barcodes/templates",
    permissions: ["barcodes.write"],
  },
  {
    method: "GET",
    path: "/admin/variants/barcode/:code",
    permissions: ["barcodes.read"],
  },
]

export const rbacAccess = {
  permissions: [...RBAC_PERMISSIONS],
  routes: RBAC_ROUTES,
}
