import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CORE_LAYOUT_IDS } from "@medusajs/admin-shared"
import { LayoutComposer } from "@medusajs/dashboard/components"
import { DocumentText } from "@medusajs/icons"
import { toast } from "@medusajs/ui"
import React, { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { TemplatesBuilderTab } from "../../../components/mpn/templates-tab"
import { RbacGuard } from "../../../components/rbac-guard"
import { useMpnTemplates } from "../../../../hooks"

const MpnTemplatesPage: React.FC = () => {
  const { t } = useTranslation("mpn")
  const handleError = useCallback(() => {
    toast.error(t("messages.loadStudioError"))
  }, [t])

  const { data, isLoading, refetch } = useMpnTemplates(undefined, {
    onError: handleError,
  })

  return (
    <LayoutComposer
      widgetsZonePrefix="mpn.templates"
      preferredLayoutId={CORE_LAYOUT_IDS.SINGLE_COLUMN}
      sections={{
        main: (
          <LayoutComposer.Entry id="MpnTemplatesSection">
            <TemplatesBuilderTab
              templates={data?.templates || []}
              isLoading={isLoading}
              onRefresh={async () => {
                await refetch()
              }}
            />
          </LayoutComposer.Entry>
        ),
      }}
    />
  )
}

const Breadcrumb = () => {
  const { t } = useTranslation("mpn")
  return t("templates.title")
}

export const config = defineRouteConfig({
  label: "nav.templates",
  translationNs: "mpn",
  icon: DocumentText,
})

export const handle = {
  breadcrumb: () => <Breadcrumb />,
}

const GuardedMpnTemplatesPage = () => (
  <RbacGuard permission="notifications.read">
    <MpnTemplatesPage />
  </RbacGuard>
)

export default GuardedMpnTemplatesPage
