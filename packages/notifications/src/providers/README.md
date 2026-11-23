# Notification Providers

Six Medusa v2 `Modules.NOTIFICATION` transport providers (`AbstractNotificationProviderService`) located under `src/providers/`.

```sh
providers/
├── index.ts                    Barrel re-exporting all 6 provider services, IDs, and option types
├── email-smtp/
│   └── index.ts                SmtpEmailNotificationProviderService (id: "mpn-email")
├── whatsapp/
│   └── index.ts                WhatsAppNotificationProviderService (id: "mpn-whatsapp")
├── telegram/
│   └── index.ts                TelegramNotificationProviderService (id: "mpn-telegram")
├── sms/
│   └── index.ts                SmsNotificationProviderService (id: "mpn-sms")
├── slack/
│   └── index.ts                SlackNotificationProviderService (id: "mpn-slack")
└── dummy-sandbox/
    └── index.ts                DummySandboxNotificationProviderService (id: "mpn-dummy-sandbox")
```

---

## Provider Overview

| Provider ID         | Resolve Path                                                        | Channels       | Supported Drivers                                     | Key Features                                                                                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------- | -------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mpn-email`         | `@vicacha-devs/medusa-plugin-notifications/providers/email-smtp`    | `["email"]`    | `nodemailer` SMTP, HTTP Relay                         | 1..5 sender profiles (`MAILER_FROM_NAME_1..5` / `MAILER_FROM_ADDRESS_1..5`), HTML + plain-text fallback, base64 PDF attachments (`medusa-plugin-documents`).                                                                            |
| `mpn-whatsapp`      | `@vicacha-devs/medusa-plugin-notifications/providers/whatsapp`      | `["whatsapp"]` | `meta-cloud`, `openwa`, `waha`, `evolution`           | Official Meta Cloud API (approved WABA templates, interactive buttons, documents, session text with `toWhatsAppDigitsOnly`) AND self-hosted **`rmyndharis/OpenWA`** (`:2785`), WAHA, and Evolution API v2 gateways.                     |
| `mpn-telegram`      | `@vicacha-devs/medusa-plugin-notifications/providers/telegram`      | `["telegram"]` | Telegram Bot API                                      | Merchant Supergroup / Forum Topic Alerts (`-100...` or `@channel` with `message_thread_id`) + Customer DMs (`chat_id`, `InlineKeyboardMarkup`, multipart `sendDocument` PDF uploads), 30 msg/s global & 1 msg/s per-chat rate limiting. |
| `mpn-sms`           | `@vicacha-devs/medusa-plugin-notifications/providers/sms`           | `["sms"]`      | `twilio`, `signalhouse`, `msg91`, `smsapi`, `webhook` | Twilio SMS/MMS + Messaging Service SID + `20xxx` permanent vs. retryable error classification, Signal House 10DLC, MSG91 Flow, SMSAPI, Generic Webhook, and GSM-7 / UCS-2 segment calculation.                                          |
| `mpn-slack`         | `@vicacha-devs/medusa-plugin-notifications/providers/slack`         | `["slack"]`    | Slack Incoming Webhook                                | Slack Block Kit JSON (`blocks` + `text`) with SSRF URL validation (`validateSafeExternalUrl`).                                                                                                                                          |
| `mpn-dummy-sandbox` | `@vicacha-devs/medusa-plugin-notifications/providers/dummy-sandbox` | `["dummy"]`    | In-Memory + DB (`mpn_sandbox_message`)                | Captures notifications across any channel and extracts 4–8 digit OTP codes for local/staging inspection in `/app/mpn/sandbox` at zero carrier cost.                                                                                     |

---

## 1. `mpn-email` (`email-smtp`)

- **Class**: `SmtpEmailNotificationProviderService`
- **Options (`SmtpEmailProviderOptions`) / Env Vars**:
  - `host` (`MAILER_SMTP_HOST`, e.g. `smtp.resend.com`), `port` (`MAILER_SMTP_PORT`, default `587` or `465`), `secure` (`MAILER_SMTP_SECURE`), `user` (`MAILER_SMTP_USER`), `pass` (`MAILER_SMTP_PASS`)
  - `from_name` (`MAILER_FROM_NAME_1..5`), `from_address` (`MAILER_FROM_ADDRESS_1..5` / `SMTP_FROM`)
  - `webhook_url` (`MAILER_HTTP_WEBHOOK_URL`, e.g. `https://api.resend.com/emails`), `api_key` (`MAILER_HTTP_API_KEY`) for direct HTTP Email API relay

---

## 2. `mpn-whatsapp` (`whatsapp`)

- **Class**: `WhatsAppNotificationProviderService`
- **4 Selectable Drivers (`WhatsAppDriver`)**:
  1. **`meta-cloud`**: Official Meta Graph API (`v21.0` / `v25.0`). Formats recipients via `toWhatsAppDigitsOnly()` (no leading `+`) and supports `type: "template"` (approved WABA templates outside the 24h window), `type: "interactive"` (reply buttons), `type: "document"`, and `type: "text"`.
  2. **`openwa`**: Self-hosted **`rmyndharis/OpenWA`** (`ENGINE_TYPE=baileys`, default port `2785`) REST API (`POST /api/sessions/{sessionId}/messages/send-text` and `POST /api/sessions/{sessionId}/messages/send-document` with `X-API-Key` + `Authorization: Bearer` headers, `@c.us` chat IDs, and validated session IDs).
  3. **`waha`**: Self-hosted WAHA (WhatsApp HTTP API) (`/api/sendText`, `/api/sendFile` with `X-Api-Key`).
  4. **`evolution`**: Self-hosted Evolution API v2 (`/message/sendText/{instance}`, `/message/sendMedia/{instance}` with `apikey` header).

---

## 3. `mpn-telegram` (`telegram`)

- **Class**: `TelegramNotificationProviderService`
- **Features**:
  - Sanitizes HTML via `sanitizeTelegramHtml` (`<b>`, `<i>`, `<u>`, `<s>`, `<code>`, `<pre>`, `<a href="...">`).
  - Supports `message_thread_id` for routing different store events (e.g., Orders vs. Low Inventory) into dedicated Telegram Supergroup Forum Topics.
  - Supports `InlineKeyboardMarkup` action buttons (`url` or `callback_data`).
  - Uploads attached PDFs (`medusa-plugin-documents`) via Telegram's `sendDocument` endpoint.
  - Enforces non-dropping rate limits (`ChannelRateLimiter`: 30 msg/s global, 1 msg/s per chat).

---

## 4. `mpn-sms` (`sms`)

- **Class**: `SmsNotificationProviderService`
- **5 Selectable Drivers (`SmsDriver`)**:
  1. **`twilio`**: Form-encoded `POST /2010-04-01/Accounts/{SID}/Messages.json` supporting `From` or `MessagingServiceSid`, MMS `MediaUrl`, and `isRetryableSmsError` (`20000`–`21999` validation error classification).
  2. **`signalhouse`**: JSON `POST /message/sendSMS` (`x-api-key`) for 10DLC SMS/MMS and abandoned cart recovery.
  3. **`msg91`**: JSON `POST https://control.msg91.com/api/v5/flow/` (`authkey` + `template_id`).
  4. **`smsapi`**: Form-encoded `POST https://api.smsapi.com/sms.do` (Bearer token).
  5. **`webhook`**: Generic SSRF-validated HTTP JSON webhook.

---

## 5. `mpn-slack` (`slack`)

- **Class**: `SlackNotificationProviderService`
- **Features**: Sends rendered `blocks` (Slack Block Kit JSON array) and fallback `text` to `webhook_url` (`SLACK_WEBHOOK_URL`) after passing `validateSafeExternalUrl`.

---

## 6. `mpn-dummy-sandbox` (`dummy-sandbox`)

- **Class**: `DummySandboxNotificationProviderService`
- **Features**: Captures messages in both `inMemorySandboxStore` (`getInMemorySandboxMessages`, `clearInMemorySandboxMessages`) and `mpn_sandbox_message` via `notificationsModuleService.captureSandboxMessage`, automatically extracting OTP codes (`extractOtpCode`) so developers and QA teams can inspect verification codes in `/app/mpn/sandbox`.
