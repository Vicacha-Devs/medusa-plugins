import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  isSuperAdminRole,
  resolveRbacService,
} from "../../../../lib/rbac-service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const rbac = resolveRbacService(req.scope);
  if (!rbac) {
    return res.status(503).json({
      message: "RBAC module (@medusajs/medusa/rbac) is not enabled in medusa-config.ts.",
    });
  }

  const roles = await rbac.listRbacRoles({});
  const assignments = await rbac.listRbacRoleAssignments({});

  const enriched = await Promise.all(
    roles.map(async (role) => {
      const policies = await rbac.listPoliciesForRole(role.id);
      const assignedUsers = assignments
        .filter((a) => a.role_id === role.id)
        .map((a) => a.actor_id);
      return {
        ...role,
        is_super_admin: isSuperAdminRole(role, policies),
        policies,
        assigned_user_ids: assignedUsers,
      };
    })
  );

  return res.json({ roles: enriched });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const rbac = resolveRbacService(req.scope);
  if (!rbac) {
    return res.status(503).json({
      message: "RBAC module (@medusajs/medusa/rbac) is not enabled.",
    });
  }

  const body = (req.body || {}) as {
    name?: string;
    description?: string | null;
    policy_ids?: string[];
  };

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return res.status(400).json({ message: "Role name is required." });
  }

  const [created] = await rbac.createRbacRoles([
    { name, description: body.description ?? null },
  ]);

  const policyIds = Array.isArray(body.policy_ids) ? body.policy_ids : [];
  if (created && policyIds.length > 0) {
    await rbac.createRbacRolePolicies(
      policyIds.map((policy_id) => ({ role_id: created.id, policy_id }))
    );
  }

  const policies = created ? await rbac.listPoliciesForRole(created.id) : [];
  return res.status(201).json({
    role: {
      ...created,
      is_super_admin: created ? isSuperAdminRole(created, policies) : false,
      policies,
      assigned_user_ids: [],
    },
  });
}
