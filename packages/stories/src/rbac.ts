// Auto-generated RBAC descriptors compatible with @abhi1693/medusa-rbac AccessControlOptions.
export type RbacPermissionTuple = readonly [id: string, label: string, group: string];
export type RbacRoutePolicy = {
  method: string;
  path: string;
  permissions: string[];
  superuser?: boolean;
};

export const RBAC_PERMISSIONS: readonly RbacPermissionTuple[] = [
  ["stories.read", "Read stories, groups & analytics", "Stories"],
  ["stories.write", "Manage stories, groups, hotspots & stickers", "Stories"],
] as const;

export const RBAC_ROUTES: RbacRoutePolicy[] = [
  { method: "POST", path: "/admin/stories/:id/hotspots", permissions: ["stories.write"] },
  { method: "DELETE", path: "/admin/stories/:id/hotspots", permissions: ["stories.write"] },
  { method: "GET", path: "/admin/stories/:id", permissions: ["stories.read"] },
  { method: "PATCH", path: "/admin/stories/:id", permissions: ["stories.write"] },
  { method: "PUT", path: "/admin/stories/:id", permissions: ["stories.write"] },
  { method: "DELETE", path: "/admin/stories/:id", permissions: ["stories.write"] },
  { method: "POST", path: "/admin/stories/:id/stickers", permissions: ["stories.write"] },
  { method: "DELETE", path: "/admin/stories/:id/stickers", permissions: ["stories.write"] },
  { method: "GET", path: "/admin/stories/analytics", permissions: ["stories.read"] },
  { method: "GET", path: "/admin/stories/groups/:id", permissions: ["stories.read"] },
  { method: "PATCH", path: "/admin/stories/groups/:id", permissions: ["stories.write"] },
  { method: "DELETE", path: "/admin/stories/groups/:id", permissions: ["stories.write"] },
  { method: "GET", path: "/admin/stories/groups", permissions: ["stories.read"] },
  { method: "POST", path: "/admin/stories/groups", permissions: ["stories.write"] },
  { method: "GET", path: "/admin/stories", permissions: ["stories.read"] },
  { method: "POST", path: "/admin/stories", permissions: ["stories.write"] },
];

export const rbacAccess = {
  permissions: [...RBAC_PERMISSIONS],
  routes: RBAC_ROUTES,
};
