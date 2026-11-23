import assert from "node:assert/strict"
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, it } from "node:test"
import {
  getSystemPresetById,
  SYSTEM_TEMPLATE_PRESETS,
} from "../modules/notifications/utils/system-presets"
import {
  htmlToPlainText,
  SmtpEmailNotificationProviderService,
} from "../providers/email-smtp"

describe("Email local preview, plain-text fallback & auth presets", () => {
  it("converts rendered HTML to clean plain text", () => {
    const html =
      "<style>body{color:red}</style><h1>Hello</h1><p>Order <strong>#42</strong><br/>Ready!</p>"
    const text = htmlToPlainText(html)
    assert.equal(text, "Hello\nOrder #42\nReady!")
  })

  it("writes a local HTML preview file when local_preview is enabled in dev", async () => {
    const previewDir = mkdtempSync(join(tmpdir(), "mpn-preview-test-"))
    const prevNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "development"
    try {
      const provider = new SmtpEmailNotificationProviderService(
        {},
        { local_preview: true, local_preview_dir: previewDir }
      )
      const res = await provider.send({
        to: "buyer@example.com",
        channel: "email",
        template: "order-placed",
        content: {
          subject: "Order <script>alert(1)</script> #100",
          html: "<p>Thank you for your order!</p>",
        },
        data: {},
      })
      assert.ok(res.id?.startsWith("email_preview_"))
      const files = readdirSync(previewDir)
      assert.equal(files.length, 1)
      const content = readFileSync(join(previewDir, files[0]), "utf8")
      assert.ok(content.includes("Thank you for your order!"))
      assert.ok(!content.includes("<script>alert(1)</script>"))
    } finally {
      process.env.NODE_ENV = prevNodeEnv
      if (existsSync(previewDir)) {
        rmSync(previewDir, { recursive: true, force: true })
      }
    }
  })

  it("exposes built-in auth and invite system presets", () => {
    const ids = [
      "system_email_invite_created",
      "system_email_invite_resent",
      "system_email_password_reset",
      "system_email_verification",
    ]
    for (const id of ids) {
      const preset = getSystemPresetById(id)
      assert.ok(preset, `Missing preset ${id}`)
      assert.ok(SYSTEM_TEMPLATE_PRESETS.some((p) => p.id === id))
    }
  })
})
