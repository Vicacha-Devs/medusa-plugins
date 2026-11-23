import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Table, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface FiscalDocRow {
  id: string
  order_id: string
  country_code: string
  driver_id: string
  document_number: string
  status: string
  is_b2b: boolean
}

const EinvoicingPage = () => {
  const [documents, setDocuments] = useState<FiscalDocRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/admin/einvoicing", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { documents?: FiscalDocRow[] }) => {
        setDocuments(data.documents ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">E-Invoicing &amp; Fiscal Compliance</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Multi-country electronic invoicing (EU Peppol, Colombia DIAN, Mexico
          CFDI, Generic UBL 2.1).
        </Text>
      </div>
      <div className="px-6 py-4">
        {loading ? (
          <Text size="small" className="text-ui-fg-subtle">
            Loading fiscal documents...
          </Text>
        ) : documents.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            No fiscal documents issued yet.
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Number</Table.HeaderCell>
                <Table.HeaderCell>Order</Table.HeaderCell>
                <Table.HeaderCell>Country / Driver</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {documents.map((doc) => (
                <Table.Row key={doc.id}>
                  <Table.Cell className="font-mono">
                    {doc.document_number}
                  </Table.Cell>
                  <Table.Cell className="font-mono">{doc.order_id}</Table.Cell>
                  <Table.Cell>
                    {doc.country_code} · {doc.driver_id}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge size="2xsmall">{doc.is_b2b ? "B2B" : "B2C"}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      size="2xsmall"
                      color={doc.status === "accepted" ? "green" : "grey"}
                    >
                      {doc.status}
                    </Badge>
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
  label: "E-Invoicing",
})

export default EinvoicingPage
