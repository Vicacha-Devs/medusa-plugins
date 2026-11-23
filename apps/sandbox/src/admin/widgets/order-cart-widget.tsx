import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { Badge, Button, Container, Drawer, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface PaymentSessionInfo {
  id: string
  provider_id: string
  status: string
  amount: number
  currency_code?: string
  data?: Record<string, unknown>
}

interface LinkedCartInfo {
  id: string
  locale?: string | null
  currency_code?: string | null
  created_at?: string
  updated_at?: string
  payment_collection?: {
    id: string
    status?: string
    amount?: number
    currency_code?: string
    payment_sessions?: PaymentSessionInfo[]
  } | null
}

const OrderCartWidget = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const [cart, setCart] = useState<LinkedCartInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`/admin/orders/${encodeURIComponent(order.id)}/cart`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            message?: string
          }
          throw new Error(body.message || `HTTP ${res.status}`)
        }
        return (await res.json()) as { cart: LinkedCartInfo }
      })
      .then((payload) => {
        if (active) {
          setCart(payload.cart)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load linked cart"
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [order.id])

  const sessions = cart?.payment_collection?.payment_sessions ?? []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Linked Cart &amp; Payment Sessions</Heading>
        {cart && (
          <Drawer>
            <Drawer.Trigger asChild>
              <Button size="small" variant="secondary">
                Inspect JSON
              </Button>
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Cart {cart.id}</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body className="overflow-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(cart, null, 2)}
                </pre>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer>
        )}
      </div>

      <div className="px-6 py-4 space-y-3">
        {loading && (
          <Text size="small" className="text-ui-fg-subtle">
            Loading linked cart...
          </Text>
        )}
        {!loading && error && (
          <Text size="small" className="text-ui-fg-subtle">
            {error}
          </Text>
        )}
        {!loading && cart && (
          <>
            <div className="flex items-center justify-between">
              <Text size="small" className="text-ui-fg-subtle">
                Cart ID
              </Text>
              <Text size="small" className="font-mono">
                {cart.id}
              </Text>
            </div>
            {cart.locale && (
              <div className="flex items-center justify-between">
                <Text size="small" className="text-ui-fg-subtle">
                  Locale
                </Text>
                <Badge size="2xsmall">{cart.locale}</Badge>
              </div>
            )}
            <div className="pt-2">
              <Text size="small" weight="plus" className="mb-2">
                Payment Sessions ({sessions.length})
              </Text>
              {sessions.length === 0 ? (
                <Text size="small" className="text-ui-fg-subtle">
                  No payment sessions recorded on this cart.
                </Text>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded border border-ui-border-base p-2 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium">
                          {session.provider_id}
                        </span>
                        <Badge size="2xsmall">{session.status}</Badge>
                      </div>
                      <div className="text-ui-fg-subtle font-mono">
                        {session.id} · {session.amount}{" "}
                        {(session.currency_code || "").toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default OrderCartWidget
