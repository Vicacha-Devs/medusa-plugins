import { ActionMenu } from "@medusajs/dashboard/components"
import { DocumentText, Eye, PlusMini } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Select,
  Skeleton,
  StatusBadge,
  Table,
  Text,
} from "@medusajs/ui"
import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { CHANNELS } from "./constants"

export interface TemplatesListSectionProps {
  templates: Array<Record<string, any>>
  isLoading?: boolean
  selectedTemplateId?: string
  channelFilter: string
  onChannelFilterChange: (channel: string) => void
  onSelectTemplate: (templateId: string) => void
  onClonePreset: (presetId: string) => void
  onCreateTemplate?: () => void
  isCloning?: boolean
}

export const TemplatesListSection: React.FC<TemplatesListSectionProps> = ({
  templates,
  isLoading = false,
  selectedTemplateId,
  channelFilter,
  onChannelFilterChange,
  onSelectTemplate,
  onClonePreset,
  onCreateTemplate,
  isCloning = false,
}) => {
  const { t } = useTranslation("mpn")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return templates.filter((tpl) => {
      if (channelFilter !== "all" && tpl.channel !== channelFilter) {
        return false
      }
      if (!q) return true
      return (
        String(tpl.label || "")
          .toLowerCase()
          .includes(q) ||
        String(tpl.name || "")
          .toLowerCase()
          .includes(q) ||
        String(tpl.channel || "")
          .toLowerCase()
          .includes(q)
      )
    })
  }, [templates, channelFilter, searchQuery])

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-x-2">
          <Heading level="h2">{t("templates.title")}</Heading>
          <Badge
            size="2xsmall"
            color="grey"
            className="whitespace-nowrap shrink-0"
          >
            {filteredTemplates.length}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-56">
            <Input
              size="small"
              type="search"
              placeholder={t("templates.title")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              size="small"
              value={channelFilter}
              onValueChange={onChannelFilterChange}
            >
              <Select.Trigger className="min-w-0 [&>span]:truncate">
                <Select.Value placeholder={t("templates.filterChannel")} />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">
                  {t("templates.allChannels")}
                </Select.Item>
                {CHANNELS.map((ch) => (
                  <Select.Item key={ch} value={ch}>
                    {ch.toUpperCase()}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          {onCreateTemplate && (
            <Button
              size="small"
              variant="primary"
              onClick={onCreateTemplate}
              className="whitespace-nowrap shrink-0"
            >
              <PlusMini />
              {t("templates.createButton")}
            </Button>
          )}
        </div>
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t("templates.title")}</Table.HeaderCell>
            <Table.HeaderCell>{t("templates.filterChannel")}</Table.HeaderCell>
            <Table.HeaderCell>{t("templates.sourceLabel")}</Table.HeaderCell>
            <Table.HeaderCell>{t("templates.modeField")}</Table.HeaderCell>
            <Table.HeaderCell className="text-right" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <Table.Row key={`skeleton-${idx}`}>
                <Table.Cell>
                  <Skeleton className="h-4 w-56" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-16" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-16" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-16" />
                </Table.Cell>
                <Table.Cell />
              </Table.Row>
            ))
          ) : filteredTemplates.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5} className="py-10 text-center">
                <div className="flex flex-col items-center gap-y-2">
                  <DocumentText className="text-ui-fg-muted" />
                  <Text size="small" className="text-ui-fg-subtle">
                    {t("templates.emptySelection")}
                  </Text>
                </div>
              </Table.Cell>
            </Table.Row>
          ) : (
            filteredTemplates.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id
              return (
                <Table.Row
                  key={tpl.id}
                  onClick={() => onSelectTemplate(tpl.id)}
                  className={
                    isSelected
                      ? "cursor-pointer bg-ui-bg-subtle-hover"
                      : "cursor-pointer hover:bg-ui-bg-subtle-hover"
                  }
                >
                  <Table.Cell className="py-3">
                    <div className="flex flex-col">
                      <Text size="small" weight="plus">
                        {tpl.label}
                      </Text>
                      <Text
                        size="xsmall"
                        className="text-ui-fg-subtle font-mono"
                      >
                        {tpl.name}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      size="2xsmall"
                      color="blue"
                      className="whitespace-nowrap shrink-0"
                    >
                      {tpl.channel}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge
                      color={tpl.source === "system" ? "grey" : "green"}
                      className="whitespace-nowrap shrink-0"
                    >
                      {tpl.source}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small" className="text-ui-fg-subtle">
                      {tpl.mode}
                    </Text>
                  </Table.Cell>
                  <Table.Cell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionMenu
                      groups={[
                        {
                          actions: [
                            {
                              label: t("templates.inspectPreview"),
                              icon: <Eye />,
                              onClick: () => onSelectTemplate(tpl.id),
                            },
                            ...(tpl.source === "system"
                              ? [
                                  {
                                    label: t("templates.cloneToDb"),
                                    icon: <PlusMini />,
                                    disabled: isCloning,
                                    onClick: () => onClonePreset(tpl.id),
                                  },
                                ]
                              : []),
                          ],
                        },
                      ]}
                    />
                  </Table.Cell>
                </Table.Row>
              )
            })
          )}
        </Table.Body>
      </Table>
    </Container>
  )
}
