import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getRegisteredPermissions } from "../../../../lib/rbac-registry";
import {
  resolveRbacService,
  syncRegisteredPolicies,
} from "../../../../lib/rbac-service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const rbac = resolveRbacService(req.scope);
  if (!rbac) {
    return res.status(503).json({
      message: "RBAC module (@medusajs/medusa/rbac) is not enabled.",
    });
  }

  await syncRegisteredPolicies(rbac);
  const policies = await rbac.listRbacPolicies({});
  const registeredMap = new Map(
    getRegisteredPermissions().map(([id, label, group]) => [id, { label, group }])
  );

  const enriched = policies.map((p) => {
    const meta = registeredMap.get(p.key);
    return {
      ...p,
      label: meta?.label ?? p.description ?? p.key,
      group: meta?.group ?? p.resource ?? "Core",
    };
  });

  return res.json({ policies: enriched });
}
