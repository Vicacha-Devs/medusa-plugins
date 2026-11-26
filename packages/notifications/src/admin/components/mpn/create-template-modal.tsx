import {
  Button,
  FocusModal,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from "@medusajs/ui"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import type { CreateOrCloneMpnTemplatePayload } from "../../../types"
import { CHANNELS, SUPPORTED_LOCALES } from "./constants"

export interface CreateTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CreateOrCloneMpnTemplatePayload) => Promise<void>
  isSubmitting?: boolean
}

function slugifyLabel(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useTranslation("mpn")
  const [label, setLabel] = useState("")
  const [name, setName] = useState("")
  const [nameEdited, setNameEdited] = useState(false)
  const [channel, setChannel] = useState<string>("email")
  const [mode, setMode] = useState<"blocks" | "raw">("blocks")
  const [locale, setLocale] = useState<string>("en")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [rawContent, setRawContent] = useState("")

  const resetForm = () => {
    setLabel("")
    setName("")
    setNameEdited(false)
    setChannel("email")
    setMode("blocks")
    setLocale("en")
    setSubject("")
    setDescription("")
    setRawContent("")
  }

  const handleLabelChange = (value: string) => {
    setLabel(value)
    if (!nameEdited) {
      setName(slugifyLabel(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return

    await onSubmit({
      label: label.trim(),
      name: name.trim() || slugifyLabel(label) || `template-${Date.now()}`,
      channel: channel as CreateOrCloneMpnTemplatePayload["channel"],
      mode,
      locale: locale as CreateOrCloneMpnTemplatePayload["locale"],
      subject: subject.trim() || null,
      description: description.trim() || null,
      raw_content: mode === "raw" ? rawContent : null,
      blocks:
        mode === "blocks"
          ? [
              {
                type: "heading",
                position: 0,
                parent_id: null,
                metadata: { text: label.trim() },
              },
              {
                type: "text",
                position: 1,
                parent_id: null,
                metadata: { text: "Hello {{data.first_name}}," },
              },
            ]
          : undefined,
    })
    resetForm()
  }

  return (
    <FocusModal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetForm()
        onOpenChange(nextOpen)
      }}
    >
      <FocusModal.Content>
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex h-full flex-col"
        >
          <FocusModal.Header>
            <div className="flex items-center justify-end gap-x-2">
              <FocusModal.Close asChild>
                <Button size="small" variant="secondary" type="button">
                  {t("templates.cancelButton")}
                </Button>
              </FocusModal.Close>
              <Button
                size="small"
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                disabled={!label.trim() || isSubmitting}
              >
                {t("templates.createButton")}
              </Button>
            </div>
          </FocusModal.Header>

          <FocusModal.Body className="flex flex-1 justify-center overflow-y-auto px-6 py-8">
            <div className="flex w-full max-w-2xl flex-col gap-y-6">
              <div>
                <Heading level="h2">{t("templates.createTitle")}</Heading>
                <Text size="small" className="mt-1 text-ui-fg-subtle">
                  {t("templates.createSubtitle")}
                </Text>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-y-2">
                  <Label size="small" weight="plus">
                    {t("templates.labelField")} *
                  </Label>
                  <Input
                    size="small"
                    required
                    placeholder={t("templates.labelPlaceholder")}
                    value={label}
                    onChange={(e) => handleLabelChange(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-y-2">
                  <Label size="small" weight="plus">
                    {t("templates.nameField")}
                  </Label>
                  <Input
                    size="small"
                    placeholder={t("templates.namePlaceholder")}
                    value={name}
                    onChange={(e) => {
                      setNameEdited(true)
                      setName(e.target.value)
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-y-2">
                  <Label size="small" weight="plus">
                    {t("mappings.channelLabel")}
                  </Label>
                  <Select value={channel} onValueChange={setChannel}>
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {CHANNELS.map((ch) => (
                        <Select.Item key={ch} value={ch}>
                          {ch.toUpperCase()}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                <div className="flex flex-col gap-y-2">
                  <Label size="small" weight="plus">
                    {t("templates.modeField")}
                  </Label>
                  <Select
                    value={mode}
                    onValueChange={(val) => setMode(val as "blocks" | "raw")}
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="blocks">blocks</Select.Item>
                      <Select.Item value="raw">raw</Select.Item>
                    </Select.Content>
                  </Select>
                </div>

                <div className="flex flex-col gap-y-2">
                  <Label size="small" weight="plus">
                    {t("templates.localeLabel")}
                  </Label>
                  <Select value={locale} onValueChange={setLocale}>
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {SUPPORTED_LOCALES.map((loc) => (
                        <Select.Item key={loc} value={loc}>
                          {loc.toUpperCase()}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-y-2">
                <Label size="small" weight="plus">
                  {t("templates.subjectLabel")}
                </Label>
                <Input
                  size="small"
                  placeholder={t("templates.subjectPlaceholder")}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label size="small" weight="plus">
                  {t("templates.descriptionField")}
                </Label>
                <Input
                  size="small"
                  placeholder={t("templates.descriptionPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {mode === "raw" && (
                <div className="flex flex-col gap-y-2">
                  <Label size="small" weight="plus">
                    {t("templates.rawContentLabel")}
                  </Label>
                  <Textarea
                    rows={6}
                    placeholder={t("templates.rawContentPlaceholder")}
                    value={rawContent}
                    onChange={(e) => setRawContent(e.target.value)}
                  />
                </div>
              )}
            </div>
          </FocusModal.Body>
        </form>
      </FocusModal.Content>
    </FocusModal>
  )
}
