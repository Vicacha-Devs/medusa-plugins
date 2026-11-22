import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Key } from "@medusajs/icons";
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Table,
  Text,
  toast,
} from "@medusajs/ui";
import { RbacGuard } from "@vicacha-devs/medusa-shared-admin/admin";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface PolicyItem {
  id: string;
  key: string;
  resource: string;
  operation: string;
  label: string;
  group: string;
}

interface RoleItem {
  id: string;
  name: string;
  description?: string | null;
  is_super_admin?: boolean;
  policies: PolicyItem[];
  assigned_user_ids: string[];
}

const RolesSettingsPage = () => {
  const { t } = useTranslation("rbac");
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>([]);
  const [policySearch, setPolicySearch] = useState("");
  const [saving, setSaving] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleIds, setInviteRoleIds] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, policiesRes] = await Promise.all([
        fetch("/admin/rbac/roles", { credentials: "include" }),
        fetch("/admin/rbac/policies", { credentials: "include" }),
      ]);
      if (!rolesRes.ok) {
        const body = (await rolesRes.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(body.message || `Failed to load roles (${rolesRes.status})`);
      }
      const rolesJson = (await rolesRes.json()) as { roles?: RoleItem[] };
      const policiesJson = policiesRes.ok
        ? ((await policiesRes.json()) as { policies?: PolicyItem[] })
        : { policies: [] };
      setRoles(rolesJson.roles ?? []);
      setPolicies(policiesJson.policies ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load RBAC data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const groupedPolicies = useMemo(() => {
    const q = policySearch.trim().toLowerCase();
    const groups = new Map<string, PolicyItem[]>();
    for (const p of policies) {
      if (
        q &&
        !p.key.toLowerCase().includes(q) &&
        !p.label.toLowerCase().includes(q) &&
        !p.group.toLowerCase().includes(q)
      ) {
        continue;
      }
      const list = groups.get(p.group) ?? [];
      list.push(p);
      groups.set(p.group, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [policies, policySearch]);

  const openCreate = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPolicyIds([]);
    setPolicySearch("");
    setDrawerOpen(true);
  };

  const openEdit = (role: RoleItem) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description ?? "");
    setSelectedPolicyIds(role.policies.map((p) => p.id));
    setPolicySearch("");
    setDrawerOpen(true);
  };

  const togglePolicy = (id: string) => {
    setSelectedPolicyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      toast.error("Role name is required.");
      return;
    }
    setSaving(true);
    try {
      const url = editingRole
        ? `/admin/rbac/roles/${editingRole.id}`
        : "/admin/rbac/roles";
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roleName.trim(),
          description: roleDescription.trim() || null,
          policy_ids: selectedPolicyIds,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message || "Failed to save role");
      }
      toast.success(editingRole ? "Role updated" : "Role created");
      setDrawerOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (role: RoleItem) => {
    try {
      const res = await fetch(`/admin/rbac/roles/${role.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message || "Failed to delete role");
      }
      toast.success("Role deleted");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete role");
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/admin/rbac/invites", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role_ids: inviteRoleIds,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message || "Failed to create invite");
      }
      toast.success(`Invitation created for ${inviteEmail.trim()}`);
      setInviteEmail("");
      setInviteRoleIds([]);
      setInviteOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create invite");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <Heading level="h1">{t("roles.title", "Roles & Permissions")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t(
              "roles.subtitle",
              "Manage staff roles, resource policies, and role-bound invitations."
            )}
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="small" onClick={() => setInviteOpen(true)}>
            {t("roles.invite", "Invite with Role")}
          </Button>
          <Button variant="primary" size="small" onClick={openCreate}>
            {t("roles.create", "Create Role")}
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <Text size="small" className="text-ui-fg-subtle">
            Loading roles...
          </Text>
        ) : error ? (
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        ) : roles.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            {t("roles.empty", "No roles configured yet.")}
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("roles.name", "Role Name")}</Table.HeaderCell>
                <Table.HeaderCell>{t("roles.policies", "Policies")}</Table.HeaderCell>
                <Table.HeaderCell>
                  {t("roles.assignedUsers", "Assigned Users")}
                </Table.HeaderCell>
                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {roles.map((role) => (
                <Table.Row key={role.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Text weight="plus">{role.name}</Text>
                      {role.is_super_admin && (
                        <Badge size="2xsmall" color="purple">
                          {t("roles.superAdminBadge", "Super Admin")}
                        </Badge>
                      )}
                    </div>
                    {role.description && (
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {role.description}
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge size="2xsmall">{role.policies.length}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge size="2xsmall">{role.assigned_user_ids.length}</Badge>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => openEdit(role)}
                      >
                        {t("roles.edit", "Edit")}
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => handleDeleteRole(role)}
                      >
                        {t("roles.delete", "Delete")}
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              {editingRole
                ? t("roles.edit", "Edit Role")
                : t("roles.create", "Create Role")}
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
            <div className="flex flex-col gap-y-1">
              <Label>{t("roles.name", "Role Name")}</Label>
              <Input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Travel Operations"
              />
            </div>
            <div className="flex flex-col gap-y-1">
              <Label>{t("roles.description", "Description")}</Label>
              <Input
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>{t("roles.policies", "Policies")}</Label>
              <Input
                value={policySearch}
                onChange={(e) => setPolicySearch(e.target.value)}
                placeholder="Filter policies..."
              />
              <div className="flex max-h-80 flex-col gap-y-3 overflow-y-auto rounded-md border p-3">
                {groupedPolicies.map(([group, items]) => (
                  <div key={group} className="flex flex-col gap-y-1.5">
                    <Text size="xsmall" weight="plus" className="text-ui-fg-subtle">
                      {group}
                    </Text>
                    {items.map((p) => (
                      <label
                        key={p.id}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={selectedPolicyIds.includes(p.id)}
                          onCheckedChange={() => togglePolicy(p.id)}
                        />
                        <span className="font-mono text-xs">{p.key}</span>
                        <span className="text-ui-fg-subtle text-xs">{p.label}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              {t("roles.cancel", "Cancel")}
            </Button>
            <Button isLoading={saving} onClick={handleSaveRole}>
              {t("roles.save", "Save")}
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      <Drawer open={inviteOpen} onOpenChange={setInviteOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{t("roles.invite", "Invite with Role")}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-1">
              <Label>Staff Email</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="staff@example.com"
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>Assign Roles on Acceptance</Label>
              <div className="flex flex-col gap-y-2 rounded-md border p-3">
                {roles.map((r) => (
                  <label
                    key={r.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={inviteRoleIds.includes(r.id)}
                      onCheckedChange={() =>
                        setInviteRoleIds((prev) =>
                          prev.includes(r.id)
                            ? prev.filter((x) => x !== r.id)
                            : [...prev, r.id]
                        )
                      }
                    />
                    <span>{r.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              {t("roles.cancel", "Cancel")}
            </Button>
            <Button isLoading={saving} onClick={handleInvite}>
              Send Invite
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Roles & Permissions",
  icon: Key,
});

const GuardedRolesSettingsPage = () => (
  <RbacGuard permission="rbac_role:*">
    <RolesSettingsPage />
  </RbacGuard>
);

export default GuardedRolesSettingsPage;
