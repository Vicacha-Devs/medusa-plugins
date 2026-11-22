import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  countSuperAdminUsers,
  resolveRbacService,
} from "../../../../../../lib/rbac-service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const rbac = resolveRbacService(req.scope);
  if (!rbac) {
    return res.status(503).json({ message: "RBAC module is not enabled." });
  }

  const { id } = req.params as { id: string };
  const assignments = await rbac.listRbacRoleAssignments({ actor_id: id });
  const roleIds = assignments.map((a) => a.role_id);
  const roles = roleIds.length > 0 ? await rbac.listRbacRoles({ id: roleIds }) : [];

  return res.json({ user_id: id, role_ids: roleIds, roles });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const rbac = resolveRbacService(req.scope);
  if (!rbac) {
    return res.status(503).json({ message: "RBAC module is not enabled." });
  }

  const { id } = req.params as { id: string };
  const body = (req.body || {}) as { role_ids?: string[] };
  if (!Array.isArray(body.role_ids)) {
    return res.status(400).json({ message: "role_ids array is required." });
  }

  const nextRoleIds = Array.from(new Set(body.role_ids));
  const { superAdminRoleIds, superAdminUserIds } = await countSuperAdminUsers(rbac);

  // Lockout protection: prevent removing Super Admin from the last Super Admin user
  if (
    superAdminUserIds.has(id) &&
    superAdminUserIds.size <= 1 &&
    !nextRoleIds.some((rid) => superAdminRoleIds.has(rid))
  ) {
    return res.status(409).json({
      message: "Cannot remove Super Admin role from the last active Super Admin user.",
    });
  }

  const existing = await rbac.listRbacRoleAssignments({ actor_id: id });
  if (existing.length > 0) {
    await rbac.deleteRbacRoleAssignments(existing.map((a) => a.id));
  }

  if (nextRoleIds.length > 0) {
    await rbac.createRbacRoleAssignments(
      nextRoleIds.map((role_id) => ({
        role_id,
        actor_id: id,
        actor_type: "user",
      }))
    );
  }

  const roles =
    nextRoleIds.length > 0 ? await rbac.listRbacRoles({ id: nextRoleIds }) : [];
  return res.json({ user_id: id, role_ids: nextRoleIds, roles });
}
