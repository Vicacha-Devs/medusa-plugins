import { CORE_LAYOUT_IDS } from "@medusajs/admin-shared"
import { LayoutComposer, SectionRow } from "@medusajs/dashboard/components"
import { ArrowLeft, PlusMini, Trash } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Skeleton,
  StatusBadge,
  Text,
  Toaster,
  toast,
  usePrompt,
} from "@medusajs/ui"
import React, { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { TemplateEditorSection } from "../../../../components/mpn/template-editor-section"
import { RbacGuard } from "../../../../components/rbac-guard"
import {
  useCreateOrCloneMpnTemplate,
  useDeleteMpnTemplate,
  useMpnTemplateDetail,
  useRenderMpnTemplatePreview,
  useUpdateMpnTemplate,
} from "../../../../../hooks"

const MpnTemplateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const templateId = id ? decodeURIComponent(id) : undefined
  const { t } = useTranslation("mpn")
  const navigate = useNavigate()
  const prompt = usePrompt()

  const { data, isLoading, isError, refetch } = useMpnTemplateDetail(templateId)
  const renderPreviewMutation = useRenderMpnTemplatePreview()
  const updateTemplateMutation = useUpdateMpnTemplate()
  const cloneTemplateMutation = useCreateOrCloneMpnTemplate()
  const deleteTemplateMutation = useDeleteMpnTemplate()

  const [draftTemplate, setDraftTemplate] = useState<Record<
    string,
    any
  > | null>(null)
  const [draftBlocks, setDraftBlocks] = useState<Array<Record<string, any>>>([])
  const [previewContextType, setPreviewContextType] = useState<string>("order")
  const [previewLocale, setPreviewLocale] = useState<string>("en")
  const [previewResult, setPreviewResult] = useState<Record<
    string,
    any
  > | null>(null)

  const handlePreviewTemplate = useCallback(
    async (targetId: string, contextType: string, locale: string) => {
      try {
        const res = await renderPreviewMutation.mutateAsync({
          template_id: targetId,
          context_type: contextType,
          locale,
          append_sms_consent_footer: true,
        })
        setPreviewResult(res.rendered || null)
      } catch {
        // Ignore preview errors
      }
    },
    [renderPreviewMutation.mutateAsync]
  )

  useEffect(() => {
    if (data?.template) {
      setDraftTemplate(data.template)
      setDraftBlocks(data.flat_blocks || [])
      const nextLocale = data.template.locale || "en"
      setPreviewLocale(nextLocale)
      void handlePreviewTemplate(
        data.template.id,
        previewContextType,
        nextLocale
      )
    }
  }, [data?.template?.id, data?.template, data?.flat_blocks])

  const handleSave = async () => {
    if (!draftTemplate || draftTemplate.source === "system") return
    try {
      await updateTemplateMutation.mutateAsync({
        id: draftTemplate.id,
        payload: {
          label: draftTemplate.label,
          subject: draftTemplate.subject,
          mode: draftTemplate.mode,
          raw_content: draftTemplate.raw_content,
          meta_template_name: draftTemplate.meta_template_name,
          blocks: draftBlocks,
        },
      })
      toast.success(t("messages.savedTemplateSuccess"))
      await refetch()
      await handlePreviewTemplate(
        draftTemplate.id,
        previewContextType,
        previewLocale
      )
    } catch {
      toast.error(t("messages.saveTemplateError"))
    }
  }

  const handleCloneToDb = async () => {
    if (!draftTemplate?.id) return
    try {
      const res = await cloneTemplateMutation.mutateAsync({
        clone_from_preset_id: draftTemplate.id,
      })
      toast.success(
        t("messages.clonedPresetSuccess", {
          label: res.template?.label || draftTemplate.id,
        })
      )
      if (res.template?.id) {
        navigate(`/mpn/templates/${encodeURIComponent(res.template.id)}`)
      }
    } catch {
      toast.error(t("messages.clonePresetError"))
    }
  }

  const handleDelete = async () => {
    if (!draftTemplate?.id || draftTemplate.source !== "db") return
    const confirmed = await prompt({
      title: t("templates.deleteConfirmTitle"),
      description: t("templates.deleteConfirmDescription", {
        label: draftTemplate.label || draftTemplate.id,
      }),
      confirmText: t("templates.deleteButton"),
      cancelText: t("templates.cancelButton"),
    })
    if (!confirmed) return

    try {
      await deleteTemplateMutation.mutateAsync({ id: draftTemplate.id })
      toast.success(t("messages.deletedTemplateSuccess"))
      navigate("/mpn/templates")
    } catch {
      toast.error(t("messages.deleteTemplateError"))
    }
  }

  const handleAddBlock = (type: string) => {
    const nextPos = draftBlocks.length
    setDraftBlocks([
      ...draftBlocks,
      {
        id: `blk_${Date.now()}`,
        type,
        position: nextPos,
        parent_id: null,
        metadata:
          type === "row"
            ? { label: "Field", value: "{{data.total_formatted}}" }
            : type === "button" || type === "actions"
              ? { text: "View Order", url: "{{data.order_url}}" }
              : { text: "New content block ({{data.first_name}})" },
      },
    ])
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-4 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError || !draftTemplate) {
    return (
      <Container className="flex flex-col items-start gap-y-4 p-6">
        <Heading level="h2">{t("templates.notFound")}</Heading>
        <Button
          size="small"
          variant="secondary"
          onClick={() => navigate("/mpn/templates")}
        >
          <ArrowLeft />
          {t("templates.backToList")}
        </Button>
      </Container>
    )
  }

  return (
    <>
      <Toaster />
      <LayoutComposer
        widgetsZonePrefix="mpn.template.details"
        preferredLayoutId={CORE_LAYOUT_IDS.TWO_COLUMN}
        sections={{
          main: (
            <LayoutComposer.Entry id="MpnTemplateEditorSection">
              <TemplateEditorSection
                selectedTemplate={draftTemplate}
                selectedBlocks={draftBlocks}
                previewContextType={previewContextType}
                previewLocale={previewLocale}
                previewResult={previewResult}
                isSaving={updateTemplateMutation.isPending}
                onTemplateChange={setDraftTemplate}
                onAddBlock={handleAddBlock}
                onRemoveBlock={(idx) =>
                  setDraftBlocks(draftBlocks.filter((_, i) => i !== idx))
                }
                onSaveTemplate={() => void handleSave()}
                onContextChange={(val) => {
                  setPreviewContextType(val)
                  if (draftTemplate.id) {
                    void handlePreviewTemplate(
                      draftTemplate.id,
                      val,
                      previewLocale
                    )
                  }
                }}
                onLocaleChange={(loc) => {
                  setPreviewLocale(loc)
                  if (draftTemplate.id) {
                    void handlePreviewTemplate(
                      draftTemplate.id,
                      previewContextType,
                      loc
                    )
                  }
                }}
              />
            </LayoutComposer.Entry>
          ),
          aside: (
            <LayoutComposer.Entry id="MpnTemplateSummarySection">
              <Container className="divide-y p-0">
                <div className="flex items-center justify-between px-6 py-4">
                  <Heading level="h2">{t("templates.detailsTitle")}</Heading>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => navigate("/mpn/templates")}
                    className="whitespace-nowrap shrink-0"
                  >
                    <ArrowLeft />
                    {t("templates.backToList")}
                  </Button>
                </div>

                <SectionRow
                  title="ID"
                  value={
                    <Text size="small" className="font-mono text-ui-fg-subtle">
                      {draftTemplate.id}
                    </Text>
                  }
                />
                <SectionRow
                  title={t("templates.nameField")}
                  value={
                    <Text size="small" className="font-mono text-ui-fg-subtle">
                      {draftTemplate.name || "—"}
                    </Text>
                  }
                />
                <SectionRow
                  title={t("mappings.channelLabel")}
                  value={
                    <Badge
                      size="2xsmall"
                      color="blue"
                      className="whitespace-nowrap shrink-0"
                    >
                      {draftTemplate.channel}
                    </Badge>
                  }
                />
                <SectionRow
                  title={t("templates.sourceLabel")}
                  value={
                    <StatusBadge
                      color={
                        draftTemplate.source === "system" ? "grey" : "green"
                      }
                      className="whitespace-nowrap shrink-0"
                    >
                      {draftTemplate.source}
                    </StatusBadge>
                  }
                />
                <SectionRow
                  title={t("templates.modeField")}
                  value={<Text size="small">{draftTemplate.mode}</Text>}
                />
                <SectionRow
                  title={t("templates.localeLabel")}
                  value={
                    <Text size="small">
                      {String(draftTemplate.locale || "en").toUpperCase()}
                    </Text>
                  }
                />

                <div className="flex flex-col gap-y-2 px-6 py-4">
                  {draftTemplate.source === "system" && (
                    <Button
                      size="small"
                      variant="primary"
                      isLoading={cloneTemplateMutation.isPending}
                      onClick={() => void handleCloneToDb()}
                      className="w-full"
                    >
                      <PlusMini />
                      {t("templates.cloneToDb")}
                    </Button>
                  )}
                  {draftTemplate.source === "db" && (
                    <Button
                      size="small"
                      variant="danger"
                      isLoading={deleteTemplateMutation.isPending}
                      onClick={() => void handleDelete()}
                      className="w-full"
                    >
                      <Trash />
                      {t("templates.deleteButton")}
                    </Button>
                  )}
                </div>
              </Container>
            </LayoutComposer.Entry>
          ),
        }}
      />
    </>
  )
}

const Breadcrumb = ({ id }: { id?: string }) => {
  const { t } = useTranslation("mpn")
  const templateId = id ? decodeURIComponent(id) : undefined
  const { data } = useMpnTemplateDetail(templateId, { enabled: !!templateId })

  return data?.template?.label || templateId || t("templates.title")
}

export const handle = {
  breadcrumb: (match: any) => <Breadcrumb id={match?.params?.id} />,
}

const GuardedMpnTemplateDetailPage = () => (
  <RbacGuard permission="notifications.read">
    <MpnTemplateDetailPage />
  </RbacGuard>
)

export default GuardedMpnTemplateDetailPage
