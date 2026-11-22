// Auto-generated RBAC descriptors compatible with @abhi1693/medusa-rbac AccessControlOptions.
export type RbacPermissionTuple = readonly [id: string, label: string, group: string];
export type RbacRoutePolicy = {
  method: string;
  path: string;
  permissions: string[];
  superuser?: boolean;
};

export const RBAC_PERMISSIONS: readonly RbacPermissionTuple[] = [
  ["dian.read", "Read DIAN documents, fiscal profiles & resolutions", "DIAN Electronic Invoicing"],
  ["dian.write", "Manage DIAN configuration, resolutions & emit documents", "DIAN Electronic Invoicing"],
] as const;

export const RBAC_ROUTES: RbacRoutePolicy[] = [
  { method: "GET", path: "/admin/dian/config", permissions: ["dian.read"] },
  { method: "POST", path: "/admin/dian/config", permissions: ["dian.write"] },
  { method: "GET", path: "/admin/dian/documents/:id/download", permissions: ["dian.read"] },
  { method: "GET", path: "/admin/dian/documents", permissions: ["dian.read"] },
  { method: "POST", path: "/admin/dian/documents", permissions: ["dian.write"] },
  { method: "GET", path: "/admin/dian/fiscal-profiles", permissions: ["dian.read"] },
  { method: "POST", path: "/admin/dian/fiscal-profiles", permissions: ["dian.write"] },
  { method: "GET", path: "/admin/dian/resolutions", permissions: ["dian.read"] },
  { method: "POST", path: "/admin/dian/resolutions", permissions: ["dian.write"] },
];

export const rbacAccess = {
  permissions: [...RBAC_PERMISSIONS],
  routes: RBAC_ROUTES,
};
