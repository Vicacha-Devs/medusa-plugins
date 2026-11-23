import { ProductHeader } from "@medusajs/dashboard/components"
import { createDataTableColumnHelper } from "@medusajs/ui"
import { ProductCell } from "@vicacha-devs/medusa-shared-admin/admin"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

const columnHelper = createDataTableColumnHelper<any>()

export const useManageItemsTableColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.display({
        id: "product",
        header: () => <ProductHeader />,
        cell: ({ row }) => <ProductCell product={row.original.product} />,
      }),
      columnHelper.accessor("sku", {
        header: t("fields.sku"),
        cell: ({ getValue }) => getValue() || "-",
      }),
      columnHelper.accessor("title", {
        header: t("fields.title"),
      }),
    ],
    [t]
  )
}
