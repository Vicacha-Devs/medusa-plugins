import { Modules } from "@medusajs/framework/utils";
import {
  getRegisteredPermissions,
  parsePermissionKey,
} from "./rbac-registry";

export interface RbacRoleRecord {
  id: string;
  name: string;
  description?: string | null;
  policies?: RbacPolicyRecord[];
}

export interface RbacPolicyRecord {
  id: string;
  key: string;
  resource: string;
  operation: string;
  description?: string | null;
}

export interface RbacRoleAssignmentRecord {
  id: string;
  role_id: string;
  actor_id: string;
  actor_type?: string;
}

export interface RbacServiceLike {
  listRbacRoles(
    filters?: Record<string, unknown>,
    config?: Record<string, unknown>
  ): Promise<RbacRoleRecord[]>;
  createRbacRoles(
    data: Array<{ name: string; description?: string | null }>
  ): Promise<RbacRoleRecord[]>;
  updateRbacRoles(
    data: Array<{ id: string; name?: string; description?: string | null }>
  ): Promise<RbacRoleRecord[]>;
  deleteRbacRoles(ids: string[]): Promise<void>;
  listRbacPolicies(
    filters?: Record<string, unknown>,
    config?: Record<string, unknown>
  ): Promise<RbacPolicyRecord[]>;
  createRbacPolicies(
    data: Array<{
      key: string;
      resource: string;
      operation: string;
      description?: string | null;
    }>
  ): Promise<RbacPolicyRecord[]>;
  listRbacRolePolicies(
    filters?: Record<string, unknown>
  ): Promise<Array<{ id: string; role_id: string; policy_id: string }>>;
  createRbacRolePolicies(
    data: Array<{ role_id: string; policy_id: string }>
  ): Promise<Array<{ id: string; role_id: string; policy_id: string }>>;
  deleteRbacRolePolicies(ids: string[]): Promise<void>;
  listRbacRoleAssignments(
    filters?: Record<string, unknown>
  ): Promise<RbacRoleAssignmentRecord[]>;
  createRbacRoleAssignments(
    data: Array<{ role_id: string; actor_id: string; actor_type?: string }>
  ): Promise<RbacRoleAssignmentRecord[]>;
  deleteRbacRoleAssignments(ids: string[]): Promise<void>;
  listPoliciesForRole(roleId: string): Promise<RbacPolicyRecord[]>;
}

export interface UserAccessContext {
  userId: string;
  isSuperAdmin: boolean;
  roleIds: string[];
  roles: RbacRoleRecord[];
  permissions: string[];
}

export const SUPER_ADMIN_ROLE_NAMES = new Set([
  "super-admin",
  "superadmin",
  "Super Admin",
  "Superadmin",
  "Superuser",
]);

export function resolveRbacService(scope: {
  resolve: <T = unknown>(key: string) => T;
}): RbacServiceLike | null {
  try {
    return scope.resolve<RbacServiceLike>(Modules.RBAC);
  } catch {
    return null;
  }
}

export function isSuperAdminRole(
  role: Pick<RbacRoleRecord, "name">,
  rolePolicies: readonly Pick<RbacPolicyRecord, "key" | "resource" | "operation">[]
): boolean {
  if (SUPER_ADMIN_ROLE_NAMES.has(role.name)) {
    return true;
  }
  return rolePolicies.some(
    (p) =>
      p.key === "*" ||
      p.key === "*:*" ||
      (p.resource === "*" && p.operation === "*")
  );
}

export async function resolveUserAccessContext(
  rbac: RbacServiceLike,
  userId: string
): Promise<UserAccessContext> {
  const assignments = await rbac.listRbacRoleAssignments({
    actor_id: userId,
  });
  const roleIds = Array.from(new Set(assignments.map((a) => a.role_id)));
  if (roleIds.length === 0) {
    return {
      userId,
      isSuperAdmin: false,
      roleIds: [],
      roles: [],
      permissions: [],
    };
  }

  const roles = await rbac.listRbacRoles({ id: roleIds });
  const permissionSet = new Set<string>();
  let superAdmin = false;

  for (const role of roles) {
    const policies = await rbac.listPoliciesForRole(role.id);
    if (isSuperAdminRole(role, policies)) {
      superAdmin = true;
    }
    for (const p of policies) {
      if (p.key) permissionSet.add(p.key);
      if (p.resource && p.operation) {
        permissionSet.add(`${p.resource}:${p.operation}`);
        permissionSet.add(`${p.resource}.${p.operation}`);
      }
    }
  }

  return {
    userId,
    isSuperAdmin: superAdmin,
    roleIds,
    roles,
    permissions: Array.from(permissionSet),
  };
}

export async function syncRegisteredPolicies(
  rbac: RbacServiceLike
): Promise<number> {
  const registered = getRegisteredPermissions();
  if (registered.length === 0) return 0;

  const existing = await rbac.listRbacPolicies({});
  const existingKeys = new Set(existing.map((p) => p.key));

  const toCreate = registered
    .filter(([key]) => !existingKeys.has(key))
    .map(([key, label]) => {
      const parsed = parsePermissionKey(key);
      return {
        key: parsed.key,
        resource: parsed.resource,
        operation: parsed.operation,
        description: label,
      };
    });

  if (toCreate.length > 0) {
    await rbac.createRbacPolicies(toCreate);
  }
  return toCreate.length;
}

export async function countSuperAdminUsers(
  rbac: RbacServiceLike
): Promise<{ superAdminRoleIds: Set<string>; superAdminUserIds: Set<string> }> {
  const allRoles = await rbac.listRbacRoles({});
  const superAdminRoleIds = new Set<string>();

  for (const role of allRoles) {
    const policies = await rbac.listPoliciesForRole(role.id);
    if (isSuperAdminRole(role, policies)) {
      superAdminRoleIds.add(role.id);
    }
  }

  if (superAdminRoleIds.size === 0) {
    return { superAdminRoleIds, superAdminUserIds: new Set() };
  }

  const assignments = await rbac.listRbacRoleAssignments({
    role_id: Array.from(superAdminRoleIds),
  });
  const superAdminUserIds = new Set(assignments.map((a) => a.actor_id));
  return { superAdminRoleIds, superAdminUserIds };
}
