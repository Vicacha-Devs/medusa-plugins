import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Table, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()
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
        <Heading level="h1">{t("heading")}</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("subtitle")}
        </Text>
      </div>
      <div className="px-6 py-4">
        {loading ? (
          <Text size="small" className="text-ui-fg-subtle">
            {t("loading")}
          </Text>
        ) : documents.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            {t("emptyDocuments")}
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("colNumber")}</Table.HeaderCell>
                <Table.HeaderCell>{t("colOrder")}</Table.HeaderCell>
                <Table.HeaderCell>{t("colCountryDriver")}</Table.HeaderCell>
                <Table.HeaderCell>{t("colType")}</Table.HeaderCell>
                <Table.HeaderCell>{t("colStatus")}</Table.HeaderCell>
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
