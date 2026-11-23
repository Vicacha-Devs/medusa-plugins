import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Table, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface AutomationRuleRow {
  id: string
  name: string
  trigger_type: "event" | "schedule" | "manual"
  event_name?: string | null
  is_active: boolean
  run_count: number
}

const AutomationsPage = () => {
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
          <Heading level="h1">Automations</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Rule-based triggers, conditions, and notification/webhook actions.
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={loadRules}>
          Refresh
        </Button>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <Text size="small" className="text-ui-fg-subtle">
            Loading automation rules...
          </Text>
        ) : rules.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            No automation rules configured yet. Create rules via POST
            /admin/automations.
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Rule</Table.HeaderCell>
                <Table.HeaderCell>Trigger</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Runs</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
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
                      {rule.is_active ? "Active" : "Paused"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{rule.run_count}</Table.Cell>
                  <Table.Cell className="flex gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => toggleActive(rule)}
                    >
                      {rule.is_active ? "Pause" : "Enable"}
                    </Button>
                    <Button
                      size="small"
                      variant="primary"
                      onClick={() => triggerNow(rule)}
                    >
                      Run
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
