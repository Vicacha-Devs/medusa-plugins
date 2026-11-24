import * as React from "react"
import { Badge, Button, Container, Heading, Table, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import type { ProductFeatureDTO } from "../../modules/product-ext/types"
import type { FeatureFormState } from "../hooks/use-product-ext-studio"

export interface FeatureBadgesTableProps {
  features: ProductFeatureDTO[]
  isBusy: boolean
  onDelete: (id: string) => void
  onCreateClick?: () => void
}

export const FeatureBadgesTable: React.FC<FeatureBadgesTableProps> = ({
  features,
  isBusy,
  onDelete,
  onCreateClick,
}) => {
  const { t } = useTranslation("product-ext")

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">
            {t("featuresTab.listTitle", { count: features.length })}
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("featuresTab.createTitle")}
          </Text>
        </div>
        {onCreateClick && (
          <Button
            size="small"
            variant="secondary"
            onClick={onCreateClick}
            className="whitespace-nowrap shrink-0"
          >
            {t("featuresTab.createButton")}
          </Button>
        )}
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t("featuresTab.titleField")}</Table.HeaderCell>
            <Table.HeaderCell>Code</Table.HeaderCell>
            <Table.HeaderCell>
              {t("featuresTab.subtitleField")}
            </Table.HeaderCell>
            <Table.HeaderCell className="text-right" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {features.map((feat) => (
            <Table.Row key={feat.id}>
              <Table.Cell className="font-medium">{feat.title}</Table.Cell>
              <Table.Cell>
                <Badge
                  size="small"
                  color="green"
                  className="whitespace-nowrap shrink-0"
                >
                  {feat.code}
                </Badge>
              </Table.Cell>
              <Table.Cell className="text-ui-fg-subtle">
                {feat.subtitle || "—"}
              </Table.Cell>
              <Table.Cell className="text-right">
                <Button
                  variant="danger"
                  size="small"
                  disabled={isBusy}
                  onClick={() => onDelete(feat.id)}
                  className="whitespace-nowrap shrink-0"
                >
                  {t("featuresTab.deleteButton")}
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  )
}

export interface FeatureBadgesTabProps {
  form: FeatureFormState
  onFormChange: React.Dispatch<React.SetStateAction<FeatureFormState>>
  features: ProductFeatureDTO[]
  isBusy: boolean
  onCreate: () => void
  onDelete: (id: string) => void
  onOpenCreateDrawer?: () => void
}

export const FeatureBadgesTab: React.FC<FeatureBadgesTabProps> = ({
  features,
  isBusy,
  onDelete,
  onOpenCreateDrawer,
}) => {
  return (
    <FeatureBadgesTable
      features={features}
      isBusy={isBusy}
      onDelete={onDelete}
      onCreateClick={onOpenCreateDrawer}
    />
  )
}
