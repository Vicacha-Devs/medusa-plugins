// Auto-generated RBAC descriptors compatible with @abhi1693/medusa-rbac AccessControlOptions.
export type RbacPermissionTuple = readonly [id: string, label: string, group: string];
export type RbacRoutePolicy = {
  method: string;
  path: string;
  permissions: string[];
  superuser?: boolean;
};

export const RBAC_PERMISSIONS: readonly RbacPermissionTuple[] = [
  ["odoo.read", "Read Odoo status, logs, metrics, mappings & conflicts", "Odoo ERP"],
  ["odoo.write", "Configure Odoo, resolve conflicts & trigger sync", "Odoo ERP"],
] as const;

export const RBAC_ROUTES: RbacRoutePolicy[] = [
  { method: "GET", path: "/admin/odoo/config", permissions: ["odoo.read"] },
  { method: "POST", path: "/admin/odoo/config", permissions: ["odoo.write"] },
  { method: "GET", path: "/admin/odoo/conflicts", permissions: ["odoo.read"] },
  { method: "POST", path: "/admin/odoo/conflicts", permissions: ["odoo.write"] },
  { method: "GET", path: "/admin/odoo/failures", permissions: ["odoo.read"] },
  { method: "POST", path: "/admin/odoo/failures", permissions: ["odoo.write"] },
  { method: "GET", path: "/admin/odoo/logs", permissions: ["odoo.read"] },
  { method: "GET", path: "/admin/odoo/mappings", permissions: ["odoo.read"] },
  { method: "POST", path: "/admin/odoo/mappings", permissions: ["odoo.write"] },
  { method: "GET", path: "/admin/odoo/metrics", permissions: ["odoo.read"] },
  { method: "GET", path: "/admin/odoo/options", permissions: ["odoo.read"] },
  { method: "GET", path: "/admin/odoo/pos-transactions", permissions: ["odoo.read"] },
  { method: "POST", path: "/admin/odoo/pos-transactions", permissions: ["odoo.write"] },
  { method: "GET", path: "/admin/odoo/sections/:section", permissions: ["odoo.read"] },
  { method: "POST", path: "/admin/odoo/sections/:section", permissions: ["odoo.write"] },
  { method: "GET", path: "/admin/odoo/status", permissions: ["odoo.read"] },
  { method: "POST", path: "/admin/odoo/sync-order/:id", permissions: ["odoo.write"] },
  { method: "POST", path: "/admin/odoo/sync/:entity", permissions: ["odoo.write"] },
  { method: "POST", path: "/admin/odoo/verify-connection", permissions: ["odoo.write"] },
];

export const rbacAccess = {
  permissions: [...RBAC_PERMISSIONS],
  routes: RBAC_ROUTES,
};
