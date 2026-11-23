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
  ["documents.read", "Read documents, PDFs, templates & settings", "Documents"],
  [
    "documents.write",
    "Generate, send, manage documents & templates",
    "Documents",
  ],
] as const

export const RBAC_ROUTES: RbacRoutePolicy[] = [
  {
    method: "GET",
    path: "/admin/documents/:id/pdf",
    permissions: ["documents.read"],
  },
  {
    method: "POST",
    path: "/admin/documents/:id/regenerate",
    permissions: ["documents.write"],
  },
  {
    method: "GET",
    path: "/admin/documents/:id",
    permissions: ["documents.read"],
  },
  {
    method: "DELETE",
    path: "/admin/documents/:id",
    permissions: ["documents.write"],
  },
  {
    method: "POST",
    path: "/admin/documents/:id/send-email",
    permissions: ["documents.write"],
  },
  {
    method: "POST",
    path: "/admin/documents/:id/send-for-signature",
    permissions: ["documents.write"],
  },
  {
    method: "POST",
    path: "/admin/documents/bulk-download",
    permissions: ["documents.write"],
  },
  {
    method: "POST",
    path: "/admin/documents/bulk-generate",
    permissions: ["documents.write"],
  },
  {
    method: "GET",
    path: "/admin/documents/export.csv",
    permissions: ["documents.read"],
  },
  {
    method: "GET",
    path: "/admin/documents/preview",
    permissions: ["documents.read"],
  },
  {
    method: "POST",
    path: "/admin/documents/preview",
    permissions: ["documents.write"],
  },
  { method: "GET", path: "/admin/documents", permissions: ["documents.read"] },
  {
    method: "POST",
    path: "/admin/documents",
    permissions: ["documents.write"],
  },
  {
    method: "GET",
    path: "/admin/documents/settings",
    permissions: ["documents.read"],
  },
  {
    method: "PUT",
    path: "/admin/documents/settings",
    permissions: ["documents.write"],
  },
  {
    method: "DELETE",
    path: "/admin/documents/settings",
    permissions: ["documents.write"],
  },
  {
    method: "GET",
    path: "/admin/documents/templates/:id",
    permissions: ["documents.read"],
  },
  {
    method: "PUT",
    path: "/admin/documents/templates/:id",
    permissions: ["documents.write"],
  },
  {
    method: "DELETE",
    path: "/admin/documents/templates/:id",
    permissions: ["documents.write"],
  },
  {
    method: "GET",
    path: "/admin/documents/templates",
    permissions: ["documents.read"],
  },
  {
    method: "POST",
    path: "/admin/documents/templates",
    permissions: ["documents.write"],
  },
  {
    method: "POST",
    path: "/admin/documents/webhooks/docuseal",
    permissions: ["documents.write"],
  },
]

export const rbacAccess = {
  permissions: [...RBAC_PERMISSIONS],
  routes: RBAC_ROUTES,
}
