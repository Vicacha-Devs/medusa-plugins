import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as {
    email?: string;
    role_ids?: string[];
  };

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) {
    return res.status(400).json({ message: "Invite email is required." });
  }

  const roleIds = Array.isArray(body.role_ids) ? body.role_ids : [];

  try {
    const userService = req.scope.resolve<{
      createInvites: (
        data: Array<{ email: string; metadata?: Record<string, unknown> }>
      ) => Promise<Array<{ id: string; email: string; token: string }>>;
    }>(Modules.USER);

    const [invite] = await userService.createInvites([
      {
        email,
        metadata: {
          rbac_role_ids: roleIds,
        },
      },
    ]);

    return res.status(201).json({ invite });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create invite.";
    return res.status(400).json({ message });
  }
}
