import type { JSX } from "react"
import { Button, DropdownMenu } from "@medusajs/ui"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"

type FilterGroupProps = {
  filters: {
    [key: string]: ReactNode
  }
  clearAllLabel?: string
  addFilterLabel?: string
}

export const FilterGroup = ({
  filters,
  clearAllLabel,
  addFilterLabel,
}: FilterGroupProps): JSX.Element | null => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const filterKeys = Object.keys(filters)

  if (filterKeys.length === 0) {
    return null
  }

  const isClearable = filterKeys.some((key) => searchParams.get(key))
  const hasMore = !filterKeys.every((key) => searchParams.get(key))
  const availableKeys = filterKeys.filter((key) => !searchParams.get(key))

  return (
    <div className="flex items-center flex-wrap gap-2">
      {hasMore && (
        <AddFilterMenu
          availableKeys={availableKeys}
          label={
            addFilterLabel ??
            t("filters.addFilter", { defaultValue: "Add filter" })
          }
        />
      )}
      {isClearable && (
        <Button variant="transparent" size="small">
          {clearAllLabel ??
            t("filters.clearAll", { defaultValue: "Clear all" })}
        </Button>
      )}
    </div>
  )
}

type AddFilterMenuProps = {
  availableKeys: string[]
  label: string
}

const AddFilterMenu = ({
  availableKeys,
  label,
}: AddFilterMenuProps): JSX.Element => {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" size="small">
          {label}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {availableKeys.map((key) => (
          <DropdownMenu.Item key={key}>{key}</DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
