import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Table, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

interface AutomationRuleRow {
  id: string
  name: string
  trigger_type: "event" | "schedule" | "manual"
  event_name?: string | null
  is_active: boolean
  run_count: number
}

const AutomationsPage = () => {
  const { t } = useTranslation()
  const [rules, setRules] = useState<AutomationRuleRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadRules = () => {
    setLoading(true)
    fetch("/admin/automations", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { rules?: AutomationRuleRow[] }) => {
        setRules(data.rules ?? [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRules()
  }, [])

  const toggleActive = async (rule: AutomationRuleRow) => {
    await fetch(`/admin/automations/${encodeURIComponent(rule.id)}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !rule.is_active }),
    })
    loadRules()
  }

  const triggerNow = async (rule: AutomationRuleRow) => {
    await fetch(`/admin/automations/${encodeURIComponent(rule.id)}/trigger`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: {} }),
    })
    loadRules()
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">{t("title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("subtitle")}
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={loadRules}>
          {t("refresh")}
        </Button>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <Text size="small" className="text-ui-fg-subtle">
            {t("loading")}
          </Text>
        ) : rules.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            {t("emptyRules")}
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("colRule")}</Table.HeaderCell>
                <Table.HeaderCell>{t("colTrigger")}</Table.HeaderCell>
                <Table.HeaderCell>{t("colStatus")}</Table.HeaderCell>
                <Table.HeaderCell>{t("colRuns")}</Table.HeaderCell>
                <Table.HeaderCell>{t("colActions")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rules.map((rule) => (
                <Table.Row key={rule.id}>
                  <Table.Cell>{rule.name}</Table.Cell>
                  <Table.Cell>
                    {rule.trigger_type}
                    {rule.event_name ? ` (${rule.event_name})` : ""}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      size="2xsmall"
                      color={rule.is_active ? "green" : "grey"}
                    >
                      {rule.is_active ? t("statusActive") : t("statusPaused")}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{rule.run_count}</Table.Cell>
                  <Table.Cell className="flex gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => toggleActive(rule)}
                    >
                      {rule.is_active ? t("actionPause") : t("actionEnable")}
                    </Button>
                    <Button
                      size="small"
                      variant="primary"
                      onClick={() => triggerNow(rule)}
                    >
                      {t("actionRun")}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Automations",
})

export default AutomationsPage
