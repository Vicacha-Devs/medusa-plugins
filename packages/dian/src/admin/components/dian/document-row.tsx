import { Badge, Button, Table } from "@medusajs/ui"

const DOWNLOAD_FORMATS = [
  { format: "pdf", labelKey: "dian.documents.pdfBtn" },
  { format: "xml", labelKey: "dian.documents.xmlBtn" },
  { format: "zip", labelKey: "dian.documents.zipBtn" },
] as const

const STATUS_COLORS: Record<string, "green" | "orange" | "red"> = {
  validated: "green",
  contingency: "orange",
}

export const DianDocumentRow: React.FC<{
  doc: Record<string, any>
  docTypeLabels: Record<string, string>
  t: (key: string) => string
}> = ({ doc, docTypeLabels, t }) => {
  const buyer = (doc.buyer_snapshot || {}) as Record<string, any>

  return (
    <Table.Row>
      <Table.Cell className="font-medium">{doc.document_number}</Table.Cell>
      <Table.Cell>
        {docTypeLabels[doc.document_type] || doc.document_type}
      </Table.Cell>
      <Table.Cell>
        <div className="flex flex-col">
          <span className="font-medium">
            {buyer.registration_name || t("dian.documents.finalConsumer")}
          </span>
          <span className="text-ui-fg-subtle text-xs">
            {buyer.identification_number || "222222222222"}
            {buyer.dv ? `-${buyer.dv}` : ""}
            {buyer.is_b2b_legal_client
              ? ` • ${t("dian.documents.b2bLegalTag")}`
              : ""}
          </span>
        </div>
      </Table.Cell>
      <Table.Cell>
        <span className="font-mono text-xs">
          {String(doc.cufe_cude || "").slice(0, 18)}...
        </span>
      </Table.Cell>
      <Table.Cell>
        {Number(doc.payable_amount || 0).toLocaleString("es-CO")}{" "}
        {doc.currency_code || "COP"}
      </Table.Cell>
      <Table.Cell>
        <Badge color={STATUS_COLORS[doc.status] ?? "red"}>{doc.status}</Badge>
      </Table.Cell>
      <Table.Cell>
        <div className="flex items-center gap-1">
          {DOWNLOAD_FORMATS.map(({ format, labelKey }) => (
            <Button key={format} variant="secondary" size="small" asChild>
              <a
                href={`/admin/dian/documents/${doc.id}/download?format=${format}`}
                target="_blank"
                rel="noreferrer"
              >
                {t(labelKey)}
              </a>
            </Button>
          ))}
        </div>
      </Table.Cell>
    </Table.Row>
  )
}
