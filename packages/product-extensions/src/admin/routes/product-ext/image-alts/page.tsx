import * as React from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CORE_LAYOUT_IDS } from "@medusajs/admin-shared"
import { LayoutComposer } from "@medusajs/dashboard/components"
import { Photo } from "@medusajs/icons"
import { Toaster } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { ImageAltsCsvSection } from "../../../components"
import { useProductExtStudio } from "../../../hooks/use-product-ext-studio"
import { RbacGuard } from "../../../components/rbac-guard"

const ImageAltsRoutePage = () => {
  const studio = useProductExtStudio()

  return (
    <LayoutComposer
      widgetsZonePrefix="product_ext.image_alts"
      preferredLayoutId={CORE_LAYOUT_IDS.SINGLE_COLUMN}
      sections={{
        main: (
          <LayoutComposer.Entry id="ProductExtImageAltsSection">
            <ImageAltsCsvSection
              csvContent={studio.csvContent}
              onCsvChange={studio.setCsvContent}
              isBusy={studio.isBusy}
              onExport={() => void studio.handleExportCsv()}
              onImport={() => void studio.handleImportCsv()}
            />
            <Toaster />
          </LayoutComposer.Entry>
        ),
      }}
    />
  )
}

const Breadcrumb = () => {
  const { t } = useTranslation("product-ext")
  return t("tabs.imageAlts")
}

export const config = defineRouteConfig({
  label: "nav.imageAlts",
  translationNs: "product-ext",
  icon: Photo,
})

export const handle = {
  breadcrumb: () => <Breadcrumb />,
}

const GuardedImageAltsRoutePage = () => (
  <RbacGuard permission="product_extensions.read">
    <ImageAltsRoutePage />
  </RbacGuard>
)

export default GuardedImageAltsRoutePage
