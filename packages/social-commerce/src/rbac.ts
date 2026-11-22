// Auto-generated RBAC descriptors compatible with @abhi1693/medusa-rbac AccessControlOptions.
export type RbacPermissionTuple = readonly [id: string, label: string, group: string];
export type RbacRoutePolicy = {
  method: string;
  path: string;
  permissions: string[];
  superuser?: boolean;
};

export const RBAC_PERMISSIONS: readonly RbacPermissionTuple[] = [
  ["social_commerce.read", "Read social accounts, catalog, posts & live streams", "Social Commerce"],
  ["social_commerce.write", "Manage social accounts, posts, live streams & sync", "Social Commerce"],
] as const;

export const RBAC_ROUTES: RbacRoutePolicy[] = [
  { method: "GET", path: "/admin/social/accounts/:id", permissions: ["social_commerce.read"] },
  { method: "POST", path: "/admin/social/accounts/:id", permissions: ["social_commerce.write"] },
  { method: "DELETE", path: "/admin/social/accounts/:id", permissions: ["social_commerce.write"] },
  { method: "GET", path: "/admin/social/accounts", permissions: ["social_commerce.read"] },
  { method: "GET", path: "/admin/social/catalog", permissions: ["social_commerce.read"] },
  { method: "POST", path: "/admin/social/catalog", permissions: ["social_commerce.write"] },
  { method: "POST", path: "/admin/social/connect", permissions: ["social_commerce.write"] },
  { method: "POST", path: "/admin/social/live/:id/products", permissions: ["social_commerce.write"] },
  { method: "POST", path: "/admin/social/live/:id", permissions: ["social_commerce.write"] },
  { method: "GET", path: "/admin/social/live", permissions: ["social_commerce.read"] },
  { method: "POST", path: "/admin/social/live", permissions: ["social_commerce.write"] },
  { method: "GET", path: "/admin/social/posts/:id/products", permissions: ["social_commerce.read"] },
  { method: "POST", path: "/admin/social/posts/:id/products", permissions: ["social_commerce.write"] },
  { method: "GET", path: "/admin/social/posts/:id", permissions: ["social_commerce.read"] },
  { method: "PATCH", path: "/admin/social/posts/:id", permissions: ["social_commerce.write"] },
  { method: "DELETE", path: "/admin/social/posts/:id", permissions: ["social_commerce.write"] },
  { method: "GET", path: "/admin/social/posts", permissions: ["social_commerce.read"] },
  { method: "POST", path: "/admin/social/posts", permissions: ["social_commerce.write"] },
  { method: "POST", path: "/admin/social/sync", permissions: ["social_commerce.write"] },
];

export const rbacAccess = {
  permissions: [...RBAC_PERMISSIONS],
  routes: RBAC_ROUTES,
};
