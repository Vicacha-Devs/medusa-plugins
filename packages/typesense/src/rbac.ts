// Auto-generated RBAC descriptors compatible with @abhi1693/medusa-rbac AccessControlOptions.
export type RbacPermissionTuple = readonly [id: string, label: string, group: string];
export type RbacRoutePolicy = {
  method: string;
  path: string;
  permissions: string[];
  superuser?: boolean;
};

export const RBAC_PERMISSIONS: readonly RbacPermissionTuple[] = [
  ["typesense.read", "Read Typesense collections, entities, synonyms, stopwords & analytics", "Typesense Search"],
  ["typesense.write", "Manage Typesense collections, documents, curations, synonyms & sync", "Typesense Search"],
] as const;

export const RBAC_ROUTES: RbacRoutePolicy[] = [
  { method: "GET", path: "/admin/typesense/analytics", permissions: ["typesense.read"] },
  { method: "POST", path: "/admin/typesense/collections/:entity/sync", permissions: ["typesense.write"] },
  { method: "GET", path: "/admin/typesense/collections", permissions: ["typesense.read"] },
  { method: "POST", path: "/admin/typesense/collections", permissions: ["typesense.write"] },
  { method: "DELETE", path: "/admin/typesense/curations/:entity/:id", permissions: ["typesense.write"] },
  { method: "GET", path: "/admin/typesense/curations/:entity", permissions: ["typesense.read"] },
  { method: "POST", path: "/admin/typesense/curations/:entity", permissions: ["typesense.write"] },
  { method: "GET", path: "/admin/typesense/documents/:entity/:id", permissions: ["typesense.read"] },
  { method: "POST", path: "/admin/typesense/documents/:entity/:id", permissions: ["typesense.write"] },
  { method: "DELETE", path: "/admin/typesense/documents/:entity/:id", permissions: ["typesense.write"] },
  { method: "GET", path: "/admin/typesense/entities/:entity", permissions: ["typesense.read"] },
  { method: "DELETE", path: "/admin/typesense/entities/:entity", permissions: ["typesense.write"] },
  { method: "GET", path: "/admin/typesense/entities", permissions: ["typesense.read"] },
  { method: "POST", path: "/admin/typesense/entities", permissions: ["typesense.write"] },
  { method: "GET", path: "/admin/typesense/health", permissions: ["typesense.read"] },
  { method: "POST", path: "/admin/typesense/playground", permissions: ["typesense.write"] },
  { method: "DELETE", path: "/admin/typesense/stopwords/:id", permissions: ["typesense.write"] },
  { method: "GET", path: "/admin/typesense/stopwords", permissions: ["typesense.read"] },
  { method: "POST", path: "/admin/typesense/stopwords", permissions: ["typesense.write"] },
  { method: "DELETE", path: "/admin/typesense/synonyms/:entity/:id", permissions: ["typesense.write"] },
  { method: "GET", path: "/admin/typesense/synonyms/:entity", permissions: ["typesense.read"] },
  { method: "POST", path: "/admin/typesense/synonyms/:entity", permissions: ["typesense.write"] },
];

export const rbacAccess = {
  permissions: [...RBAC_PERMISSIONS],
  routes: RBAC_ROUTES,
};
