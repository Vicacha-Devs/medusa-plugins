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
    "product_extensions.read",
    "Read product attributes, features & templates",
    "Product Extensions",
  ],
  [
    "product_extensions.write",
    "Manage product attributes, features, templates & media",
    "Product Extensions",
  ],
] as const

export const RBAC_ROUTES: RbacRoutePolicy[] = [
  {
    method: "PATCH",
    path: "/admin/product-ext/attributes/:id",
    permissions: ["product_extensions.write"],
  },
  {
    method: "DELETE",
    path: "/admin/product-ext/attributes/:id",
    permissions: ["product_extensions.write"],
  },
  {
    method: "GET",
    path: "/admin/product-ext/attributes",
    permissions: ["product_extensions.read"],
  },
  {
    method: "POST",
    path: "/admin/product-ext/attributes",
    permissions: ["product_extensions.write"],
  },
  {
    method: "PATCH",
    path: "/admin/product-ext/features/:id",
    permissions: ["product_extensions.write"],
  },
  {
    method: "DELETE",
    path: "/admin/product-ext/features/:id",
    permissions: ["product_extensions.write"],
  },
  {
    method: "GET",
    path: "/admin/product-ext/features",
    permissions: ["product_extensions.read"],
  },
  {
    method: "POST",
    path: "/admin/product-ext/features",
    permissions: ["product_extensions.write"],
  },
  {
    method: "GET",
    path: "/admin/product-ext/image-alts",
    permissions: ["product_extensions.read"],
  },
  {
    method: "POST",
    path: "/admin/product-ext/image-alts",
    permissions: ["product_extensions.write"],
  },
  {
    method: "PATCH",
    path: "/admin/product-ext/templates/:id",
    permissions: ["product_extensions.write"],
  },
  {
    method: "DELETE",
    path: "/admin/product-ext/templates/:id",
    permissions: ["product_extensions.write"],
  },
  {
    method: "GET",
    path: "/admin/product-ext/templates",
    permissions: ["product_extensions.read"],
  },
  {
    method: "POST",
    path: "/admin/product-ext/templates",
    permissions: ["product_extensions.write"],
  },
  {
    method: "GET",
    path: "/admin/products/:product_id/attributes",
    permissions: ["product_extensions.read"],
  },
  {
    method: "POST",
    path: "/admin/products/:product_id/attributes",
    permissions: ["product_extensions.write"],
  },
  {
    method: "GET",
    path: "/admin/products/:product_id/extension",
    permissions: ["product_extensions.read"],
  },
  {
    method: "POST",
    path: "/admin/products/:product_id/extension",
    permissions: ["product_extensions.write"],
  },
  {
    method: "GET",
    path: "/admin/products/:product_id/variants/:variant_id/extension",
    permissions: ["product_extensions.read"],
  },
  {
    method: "POST",
    path: "/admin/products/:product_id/variants/:variant_id/extension",
    permissions: ["product_extensions.write"],
  },
  {
    method: "POST",
    path: "/admin/products/:product_id/variants/bulk-media",
    permissions: ["product_extensions.write"],
  },
]

export const rbacAccess = {
  permissions: [...RBAC_PERMISSIONS],
  routes: RBAC_ROUTES,
}
