import { SectionRow } from "@medusajs/dashboard/components"
import { Badge, Container, Heading, StatusBadge } from "@medusajs/ui"
import React from "react"
import { useTranslation } from "react-i18next"

export interface BroadcastConsentSectionProps {
  consentSummary: Record<string, any> | null
}

export const BroadcastConsentSection: React.FC<
  BroadcastConsentSectionProps
> = ({ consentSummary }) => {
  const { t } = useTranslation("mpn")

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("tabs.broadcasts")}</Heading>
      </div>
      <SectionRow
        title="SMS"
        value={
          <StatusBadge color="green" className="whitespace-nowrap shrink-0">
            {t("broadcasts.smsOptedIn", {
              count: consentSummary?.opted_in_sms ?? 0,
            })}
          </StatusBadge>
        }
      />
      <SectionRow
        title="WhatsApp"
        value={
          <StatusBadge color="green" className="whitespace-nowrap shrink-0">
            {t("broadcasts.whatsappOptedIn", {
              count: consentSummary?.opted_in_whatsapp ?? 0,
            })}
          </StatusBadge>
        }
      />
      <SectionRow
        title="Telegram"
        value={
          <Badge
            size="2xsmall"
            color="blue"
            className="whitespace-nowrap shrink-0"
          >
            {t("broadcasts.telegramLinked", {
              count: consentSummary?.opted_in_telegram ?? 0,
            })}
          </Badge>
        }
      />
      <SectionRow
        title="STOP"
        value={
          <StatusBadge color="red" className="whitespace-nowrap shrink-0">
            {t("broadcasts.optedOut", {
              count: consentSummary?.opted_out_total ?? 0,
            })}
          </StatusBadge>
        }
      />
    </Container>
  )
}
