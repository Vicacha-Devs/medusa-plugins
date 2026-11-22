import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  resolveRbacService,
  resolveUserAccessContext,
} from "../../../../lib/rbac-service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const actorId = (
    req as unknown as { auth_context?: { actor_id?: string } }
  ).auth_context?.actor_id;

  if (!actorId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const rbac = resolveRbacService(req.scope);
  if (!rbac) {
    return res.json({
      userId: actorId,
      rbacModuleAvailable: false,
      isSuperAdmin: true,
      roles: [],
      permissions: ["*"],
    });
  }

  const ctx = await resolveUserAccessContext(rbac, actorId);
  return res.json({
    userId: ctx.userId,
    rbacModuleAvailable: true,
    isSuperAdmin: ctx.isSuperAdmin,
    roles: ctx.roles.map((r) => ({ id: r.id, name: r.name })),
    permissions: ctx.permissions,
  });
}
