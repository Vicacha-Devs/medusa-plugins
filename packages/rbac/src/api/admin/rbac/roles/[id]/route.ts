import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  countSuperAdminUsers,
  isSuperAdminRole,
  resolveRbacService,
} from "../../../../../lib/rbac-service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const rbac = resolveRbacService(req.scope);
  if (!rbac) {
    return res.status(503).json({ message: "RBAC module is not enabled." });
  }

  const { id } = req.params as { id: string };
  const [role] = await rbac.listRbacRoles({ id });
  if (!role) {
    return res.status(404).json({ message: "Role not found." });
  }

  const policies = await rbac.listPoliciesForRole(role.id);
  const assignments = await rbac.listRbacRoleAssignments({ role_id: role.id });

  return res.json({
    role: {
      ...role,
      is_super_admin: isSuperAdminRole(role, policies),
      policies,
      assigned_user_ids: assignments.map((a) => a.actor_id),
    },
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const rbac = resolveRbacService(req.scope);
  if (!rbac) {
    return res.status(503).json({ message: "RBAC module is not enabled." });
  }

  const { id } = req.params as { id: string };
  const [existing] = await rbac.listRbacRoles({ id });
  if (!existing) {
    return res.status(404).json({ message: "Role not found." });
  }

  const body = (req.body || {}) as {
    name?: string;
    description?: string | null;
    policy_ids?: string[];
  };

  if (typeof body.name === "string" || body.description !== undefined) {
    await rbac.updateRbacRoles([
      {
        id,
        ...(typeof body.name === "string" && body.name.trim()
          ? { name: body.name.trim() }
          : {}),
        ...(body.description !== undefined
          ? { description: body.description }
          : {}),
      },
    ]);
  }

  if (Array.isArray(body.policy_ids)) {
    const existingLinks = await rbac.listRbacRolePolicies({ role_id: id });
    if (existingLinks.length > 0) {
      await rbac.deleteRbacRolePolicies(existingLinks.map((l) => l.id));
    }
    if (body.policy_ids.length > 0) {
      await rbac.createRbacRolePolicies(
        body.policy_ids.map((policy_id) => ({ role_id: id, policy_id }))
      );
    }
  }

  const [updated] = await rbac.listRbacRoles({ id });
  const policies = await rbac.listPoliciesForRole(id);
  const assignments = await rbac.listRbacRoleAssignments({ role_id: id });

  return res.json({
    role: {
      ...updated,
      is_super_admin: updated ? isSuperAdminRole(updated, policies) : false,
      policies,
      assigned_user_ids: assignments.map((a) => a.actor_id),
    },
  });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const rbac = resolveRbacService(req.scope);
  if (!rbac) {
    return res.status(503).json({ message: "RBAC module is not enabled." });
  }

  const { id } = req.params as { id: string };
  const [existing] = await rbac.listRbacRoles({ id });
  if (!existing) {
    return res.status(404).json({ message: "Role not found." });
  }

  const { superAdminRoleIds } = await countSuperAdminUsers(rbac);
  if (superAdminRoleIds.has(id) && superAdminRoleIds.size <= 1) {
    return res.status(409).json({
      message: "Cannot delete the last Super Admin role (lockout protection).",
    });
  }

  await rbac.deleteRbacRoles([id]);
  return res.json({ id, object: "rbac_role", deleted: true });
}
