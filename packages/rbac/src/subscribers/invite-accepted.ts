import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { resolveRbacService } from "../lib/rbac-service";

export default async function inviteAcceptedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const rbac = resolveRbacService(container);
  if (!rbac || !data?.id) return;

  try {
    const userService = container.resolve<{
      retrieveInvite?: (id: string) => Promise<{
        id: string;
        email: string;
        metadata?: Record<string, unknown> | null;
      }>;
      listUsers?: (filters: { email?: string }) => Promise<Array<{ id: string }>>;
    }>(Modules.USER);

    const invite = await userService.retrieveInvite?.(data.id);
    const roleIds = Array.isArray(invite?.metadata?.rbac_role_ids)
      ? (invite.metadata.rbac_role_ids as string[]).filter(
          (id) => typeof id === "string" && id.length > 0
        )
      : [];

    if (roleIds.length === 0 || !invite?.email) return;

    const users = (await userService.listUsers?.({ email: invite.email })) ?? [];
    const user = users[0];
    if (!user?.id) return;

    const existing = await rbac.listRbacRoleAssignments({ actor_id: user.id });
    const existingSet = new Set(existing.map((a) => a.role_id));
    const toAssign = roleIds.filter((rid) => !existingSet.has(rid));

    if (toAssign.length > 0) {
      await rbac.createRbacRoleAssignments(
        toAssign.map((role_id) => ({
          role_id,
          actor_id: user.id,
          actor_type: "user",
        }))
      );
    }
  } catch {
    // Non-fatal if invite metadata or user lookup is unavailable
  }
}

export const config: SubscriberConfig = {
  event: "invite.accepted",
};
