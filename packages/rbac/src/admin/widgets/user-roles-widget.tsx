import { defineWidgetConfig } from "@medusajs/admin-sdk";
import {
  Button,
  Checkbox,
  Container,
  Heading,
  Text,
  toast,
} from "@medusajs/ui";
import { RbacGuard } from "@vicacha-devs/medusa-shared-admin/admin";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface RoleSummary {
  id: string;
  name: string;
}

const UserRolesWidget = ({ data }: { data?: { id?: string } }) => {
  const { t } = useTranslation("rbac");
  const userId = data?.id;
  const [allRoles, setAllRoles] = useState<RoleSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    Promise.all([
      fetch("/admin/rbac/roles", { credentials: "include" }).then((r) =>
        r.ok ? r.json() : { roles: [] }
      ),
      fetch(`/admin/rbac/users/${userId}/roles`, { credentials: "include" }).then(
        (r) => (r.ok ? r.json() : { role_ids: [] })
      ),
    ])
      .then(([rolesData, userRolesData]) => {
        if (!active) return;
        setAllRoles((rolesData as { roles?: RoleSummary[] }).roles ?? []);
        setSelectedIds((userRolesData as { role_ids?: string[] }).role_ids ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [userId]);

  if (!userId) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/admin/rbac/users/${userId}/roles`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role_ids: selectedIds }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message || "Failed to update user roles");
      }
      toast.success(t("userWidget.saved", "User roles updated."));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user roles");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RbacGuard permission="rbac_role:*" hideOnDenied>
      <Container className="flex flex-col gap-y-3 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h2">
              {t("userWidget.title", "Assigned RBAC Roles")}
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t(
                "userWidget.subtitle",
                "Select roles assigned to this staff account."
              )}
            </Text>
          </div>
          <Button size="small" isLoading={saving} onClick={handleSave}>
            {t("userWidget.save", "Save Roles")}
          </Button>
        </div>
        <div className="flex flex-col gap-y-2">
          {allRoles.map((role) => (
            <label
              key={role.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={selectedIds.includes(role.id)}
                onCheckedChange={() =>
                  setSelectedIds((prev) =>
                    prev.includes(role.id)
                      ? prev.filter((x) => x !== role.id)
                      : [...prev, role.id]
                  )
                }
              />
              <span>{role.name}</span>
            </label>
          ))}
        </div>
      </Container>
    </RbacGuard>
  );
};

export const config = defineWidgetConfig({
  zone: "user.details.after",
});

export default UserRolesWidget;
