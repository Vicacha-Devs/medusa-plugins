// Auto-generated RBAC descriptors compatible with @abhi1693/medusa-rbac AccessControlOptions.
export type RbacPermissionTuple = readonly [id: string, label: string, group: string];
export type RbacRoutePolicy = {
  method: string;
  path: string;
  permissions: string[];
  superuser?: boolean;
};

export const RBAC_PERMISSIONS: readonly RbacPermissionTuple[] = [
  ["notifications.read", "Read notification channels, templates, mappings & logs", "Notifications"],
  ["notifications.write", "Send notifications, broadcasts & manage templates/mappings", "Notifications"],
] as const;

export const RBAC_ROUTES: RbacRoutePolicy[] = [
  { method: "GET", path: "/admin/mpn/broadcasts", permissions: ["notifications.read"] },
  { method: "POST", path: "/admin/mpn/broadcasts", permissions: ["notifications.write"] },
  { method: "GET", path: "/admin/mpn/channels", permissions: ["notifications.read"] },
  { method: "POST", path: "/admin/mpn/channels", permissions: ["notifications.write"] },
  { method: "GET", path: "/admin/mpn/logs", permissions: ["notifications.read"] },
  { method: "POST", path: "/admin/mpn/mappings/:id", permissions: ["notifications.write"] },
  { method: "DELETE", path: "/admin/mpn/mappings/:id", permissions: ["notifications.write"] },
  { method: "GET", path: "/admin/mpn/mappings", permissions: ["notifications.read"] },
  { method: "POST", path: "/admin/mpn/mappings", permissions: ["notifications.write"] },
  { method: "POST", path: "/admin/mpn/render-template", permissions: ["notifications.write"] },
  { method: "GET", path: "/admin/mpn/sandbox", permissions: ["notifications.read"] },
  { method: "DELETE", path: "/admin/mpn/sandbox", permissions: ["notifications.write"] },
  { method: "POST", path: "/admin/mpn/send", permissions: ["notifications.write"] },
  { method: "GET", path: "/admin/mpn/templates/:id", permissions: ["notifications.read"] },
  { method: "POST", path: "/admin/mpn/templates/:id", permissions: ["notifications.write"] },
  { method: "DELETE", path: "/admin/mpn/templates/:id", permissions: ["notifications.write"] },
  { method: "GET", path: "/admin/mpn/templates", permissions: ["notifications.read"] },
  { method: "POST", path: "/admin/mpn/templates", permissions: ["notifications.write"] },
];

export const rbacAccess = {
  permissions: [...RBAC_PERMISSIONS],
  routes: RBAC_ROUTES,
};
