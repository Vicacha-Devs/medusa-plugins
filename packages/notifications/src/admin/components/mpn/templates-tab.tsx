import { Toaster, toast } from "@medusajs/ui"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useCreateOrCloneMpnTemplate } from "../../../hooks"
import type { CreateOrCloneMpnTemplatePayload } from "../../../types"
import type { StatusBannerState } from "./constants"
import { CreateTemplateModal } from "./create-template-modal"
import { TemplatesListSection } from "./templates-list-section"

export interface TemplatesBuilderTabProps {
  templates: Array<Record<string, any>>
  isLoading?: boolean
  onRefresh: () => Promise<void>
  onStatus?: (status: StatusBannerState) => void
}

export const TemplatesBuilderTab: React.FC<TemplatesBuilderTabProps> = ({
  templates,
  isLoading = false,
  onRefresh,
  onStatus,
}) => {
  const { t } = useTranslation("mpn")
  const navigate = useNavigate()
  const [channelFilter, setChannelFilter] = useState<string>("all")
  const [createOpen, setCreateOpen] = useState(false)

  const createOrCloneMutation = useCreateOrCloneMpnTemplate()

  const navigateToTemplate = (templateId: string) => {
    navigate(`/mpn/templates/${encodeURIComponent(templateId)}`)
  }

  const handleClonePresetToDb = async (presetId: string) => {
    try {
      const data = await createOrCloneMutation.mutateAsync({
        clone_from_preset_id: presetId,
      })
      const msg = t("messages.clonedPresetSuccess", {
        label: data.template?.label || presetId,
      })
      toast.success(msg)
      onStatus?.({ type: "success", text: msg })
      await onRefresh()
      if (data.template?.id) {
        navigateToTemplate(data.template.id)
      }
    } catch {
      const msg = t("messages.clonePresetError")
      toast.error(msg)
      onStatus?.({ type: "error", text: msg })
    }
  }

  const handleCreateTemplate = async (
    payload: CreateOrCloneMpnTemplatePayload
  ) => {
    try {
      const data = await createOrCloneMutation.mutateAsync(payload)
      const msg = t("messages.createdTemplateSuccess", {
        label: data.template?.label || payload.label || payload.name,
      })
      toast.success(msg)
      onStatus?.({ type: "success", text: msg })
      setCreateOpen(false)
      await onRefresh()
      if (data.template?.id) {
        navigateToTemplate(data.template.id)
      }
    } catch {
      const msg = t("messages.createTemplateError")
      toast.error(msg)
      onStatus?.({ type: "error", text: msg })
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Toaster />
      <TemplatesListSection
        templates={templates}
        isLoading={isLoading}
        channelFilter={channelFilter}
        onChannelFilterChange={setChannelFilter}
        onSelectTemplate={navigateToTemplate}
        onClonePreset={(id) => void handleClonePresetToDb(id)}
        onCreateTemplate={() => setCreateOpen(true)}
        isCloning={createOrCloneMutation.isPending}
      />

      <CreateTemplateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateTemplate}
        isSubmitting={createOrCloneMutation.isPending}
      />
    </div>
  )
}
