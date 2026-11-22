export type RbacPermissionTuple = readonly [
  id: string,
  label: string,
  group: string,
];

export type RbacRoutePolicy = {
  method: string;
  path: string;
  permissions: string[];
  superuser?: boolean;
};

export interface RbacAccessBundle {
  permissions?: readonly RbacPermissionTuple[];
  routes?: readonly RbacRoutePolicy[];
}

export interface ParsedPermissionKey {
  key: string;
  resource: string;
  operation: string;
}

const registeredPermissions = new Map<string, RbacPermissionTuple>();
const registeredRoutes: RbacRoutePolicy[] = [];

export function parsePermissionKey(permission: string): ParsedPermissionKey {
  const sep = permission.includes(":") ? ":" : permission.includes(".") ? "." : null;
  if (!sep) {
    return { key: permission, resource: permission, operation: "*" };
  }
  const [resource, ...rest] = permission.split(sep);
  const operation = rest.join(sep) || "*";
  return { key: permission, resource, operation };
}

export function registerRbacAccess(bundles: readonly RbacAccessBundle[]): void {
  for (const bundle of bundles) {
    for (const perm of bundle.permissions ?? []) {
      registeredPermissions.set(perm[0], perm);
    }
    for (const route of bundle.routes ?? []) {
      const idx = registeredRoutes.findIndex(
        (r) =>
          r.method.toUpperCase() === route.method.toUpperCase() &&
          r.path === route.path
      );
      const normalized = {
        ...route,
        method: route.method.toUpperCase(),
      };
      if (idx >= 0) {
        registeredRoutes[idx] = normalized;
      } else {
        registeredRoutes.push(normalized);
      }
    }
  }
}

export function getRegisteredPermissions(): RbacPermissionTuple[] {
  return Array.from(registeredPermissions.values());
}

export function getRegisteredRoutes(): RbacRoutePolicy[] {
  return [...registeredRoutes];
}

export function clearRbacRegistry(): void {
  registeredPermissions.clear();
  registeredRoutes.length = 0;
}

function pathMatchesPattern(pattern: string, actualPath: string): boolean {
  const pParts = pattern.split("/").filter(Boolean);
  const aParts = actualPath.split("/").filter(Boolean);
  if (pParts.length !== aParts.length) return false;
  return pParts.every((seg, i) => seg.startsWith(":") || seg === aParts[i]);
}

export function matchRegisteredRoute(
  method: string,
  path: string
): RbacRoutePolicy | null {
  const upperMethod = method.toUpperCase();
  const cleanPath = path.split("?")[0] || "/";
  // Exact static match first, then parameterized
  const exact = registeredRoutes.find(
    (r) => r.method === upperMethod && r.path === cleanPath
  );
  if (exact) return exact;
  return (
    registeredRoutes.find(
      (r) => r.method === upperMethod && pathMatchesPattern(r.path, cleanPath)
    ) ?? null
  );
}

export function hasMatchingPermission(
  grantedKeys: readonly string[],
  requiredKeys: readonly string[],
  isSuperAdmin = false
): boolean {
  if (isSuperAdmin) return true;
  if (requiredKeys.length === 0) return true;
  return requiredKeys.every((req) => {
    if (
      grantedKeys.includes("*") ||
      grantedKeys.includes("*:*") ||
      grantedKeys.includes(req)
    ) {
      return true;
    }
    const { resource, operation } = parsePermissionKey(req);
    return (
      grantedKeys.includes(`${resource}.*`) ||
      grantedKeys.includes(`${resource}:*`) ||
      grantedKeys.includes(`${resource}.${operation}`) ||
      grantedKeys.includes(`${resource}:${operation}`)
    );
  });
}
