import { SectionRow } from "@medusajs/dashboard/components"
import {
  Badge,
  Button,
  Container,
  Heading,
  Label,
  Select,
  StatusBadge,
  Text,
} from "@medusajs/ui"
import React from "react"
import { useTranslation } from "react-i18next"

export interface ChannelsSideSectionProps {
  smsDriverInput: string
  emailConfigured?: boolean
  isPending: boolean
  onSmsDriverChange: (driver: string) => void
  onSaveSms: () => void
}

export const ChannelsSideSection: React.FC<ChannelsSideSectionProps> = ({
  smsDriverInput,
  emailConfigured = false,
  isPending,
  onSmsDriverChange,
  onSaveSms,
}) => {
  const { t } = useTranslation("mpn")

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h2">{t("channels.smsTitle")}</Heading>
            <Text className="text-ui-fg-subtle text-xs mt-1">
              {t("channels.smsSubtitle")}
            </Text>
          </div>
          <Badge
            size="2xsmall"
            color="blue"
            className="whitespace-nowrap shrink-0"
          >
            {smsDriverInput}
          </Badge>
        </div>

        <SectionRow
          title={t("channels.smsDriverLabel")}
          value={smsDriverInput}
        />

        <div className="flex flex-col gap-y-3 px-6 py-4">
          <div className="flex flex-col gap-y-2">
            <Label size="small">{t("channels.smsDriverLabel")}</Label>
            <Select
              size="small"
              value={smsDriverInput}
              onValueChange={onSmsDriverChange}
            >
              <Select.Trigger className="min-w-0 [&>span]:truncate">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="twilio">
                  {t("channels.driverTwilio")}
                </Select.Item>
                <Select.Item value="signalhouse">
                  {t("channels.driverSignalHouse")}
                </Select.Item>
                <Select.Item value="msg91">
                  {t("channels.driverMsg91")}
                </Select.Item>
                <Select.Item value="smsapi">
                  {t("channels.driverSmsApi")}
                </Select.Item>
                <Select.Item value="dummy">
                  {t("channels.driverDummy")}
                </Select.Item>
              </Select.Content>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button
              size="small"
              variant="primary"
              isLoading={isPending}
              onClick={onSaveSms}
              className="whitespace-nowrap shrink-0"
            >
              {t("channels.saveSmsButton")}
            </Button>
          </div>
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="flex items-center justify-between gap-x-4 px-6 py-4">
          <div>
            <Heading level="h2">{t("channels.emailSmtpTitle")}</Heading>
            <Text className="text-ui-fg-subtle text-xs mt-1">
              {t("channels.emailSmtpSubtitle")}
            </Text>
          </div>
          <StatusBadge
            color={emailConfigured ? "green" : "orange"}
            className="whitespace-nowrap shrink-0"
          >
            {emailConfigured
              ? t("channels.emailConfiguredBadge")
              : t("channels.emailEnvNotSetBadge")}
          </StatusBadge>
        </div>
        <SectionRow title={t("channels.driverLabel")} value="smtp" />
      </Container>
    </div>
  )
}
