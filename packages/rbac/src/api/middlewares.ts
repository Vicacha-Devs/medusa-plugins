import {
  authenticate,
  defineMiddlewares,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http";
import {
  hasMatchingPermission,
  matchRegisteredRoute,
} from "../lib/rbac-registry";
import {
  resolveRbacService,
  resolveUserAccessContext,
} from "../lib/rbac-service";

async function rbacPolicyGuard(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const path = req.path || req.originalUrl || "";
  // Always allow authenticated users to read their own effective permissions
  if (path === "/admin/rbac/me" || path.startsWith("/admin/rbac/me?")) {
    return next();
  }

  const matched = matchRegisteredRoute(req.method, path);
  const isRbacAdminRoute =
    path.startsWith("/admin/rbac/") && !path.startsWith("/admin/rbac/me");

  if (!matched && !isRbacAdminRoute) {
    return next();
  }

  const rbac = resolveRbacService(req.scope);
  if (!rbac) {
    return next();
  }

  const actorId = (
    req as unknown as { auth_context?: { actor_id?: string } }
  ).auth_context?.actor_id;

  if (!actorId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const ctx = await resolveUserAccessContext(rbac, actorId);

  if (isRbacAdminRoute) {
    const canManageRbac =
      ctx.isSuperAdmin ||
      hasMatchingPermission(ctx.permissions, ["rbac_role:*"], false) ||
      hasMatchingPermission(ctx.permissions, ["rbac.manage"], false);
    if (!canManageRbac) {
      return res.status(403).json({
        message: "Forbidden: RBAC management requires Super Admin or rbac_role:* permission.",
      });
    }
    return next();
  }

  if (matched) {
    if (matched.superuser && !ctx.isSuperAdmin) {
      return res.status(403).json({
        message: "Forbidden: Super Admin role required.",
      });
    }
    if (!hasMatchingPermission(ctx.permissions, matched.permissions, ctx.isSuperAdmin)) {
      return res.status(403).json({
        message: `Forbidden: missing required permission (${matched.permissions.join(", ")})`,
      });
    }
  }

  return next();
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/*",
      middlewares: [authenticate("user", ["session", "bearer"]), rbacPolicyGuard],
    },
  ],
});
