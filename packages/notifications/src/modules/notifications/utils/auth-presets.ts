import type { SystemTemplatePreset } from "../../../types"

export const AUTH_SYSTEM_TEMPLATE_PRESETS: SystemTemplatePreset[] = [
  {
    id: "system_email_invite_created",
    name: "invite-created-email",
    label: "Admin Invitation (Email)",
    description:
      "Medusa Admin team member invitation email triggered on invite.created.",
    channel: "email",
    mode: "blocks",
    default_event: "invite.created",
    subject: "You have been invited to {{data.store_name}}",
    blocks: [
      {
        id: "blk_inv_1",
        type: "heading",
        position: 0,
        parent_id: null,
        metadata: { level: 1, align: "center", text: "You're Invited" },
      },
      {
        id: "blk_inv_2",
        type: "text",
        position: 1,
        parent_id: null,
        metadata: {
          align: "left",
          text: "You have been invited to join the Medusa Admin workspace. Click below to accept your invitation.",
        },
      },
      {
        id: "blk_inv_3",
        type: "button",
        position: 2,
        parent_id: null,
        metadata: { text: "Accept Invitation", url: "{{data.invite_url}}" },
      },
    ],
  },
  {
    id: "system_email_invite_resent",
    name: "invite-resent-email",
    label: "Resent Admin Invitation (Email)",
    description:
      "Reminder email when an Admin invitation is resent (invite.resent).",
    channel: "email",
    mode: "blocks",
    default_event: "invite.resent",
    subject: "Reminder: Your invitation to {{data.store_name}}",
    blocks: [
      {
        id: "blk_invr_1",
        type: "heading",
        position: 0,
        parent_id: null,
        metadata: { level: 1, align: "center", text: "Invitation Reminder" },
      },
      {
        id: "blk_invr_2",
        type: "text",
        position: 1,
        parent_id: null,
        metadata: {
          align: "left",
          text: "Your Medusa Admin invitation is still waiting. Use the link below to complete your account setup.",
        },
      },
      {
        id: "blk_invr_3",
        type: "button",
        position: 2,
        parent_id: null,
        metadata: { text: "Accept Invitation", url: "{{data.invite_url}}" },
      },
    ],
  },
  {
    id: "system_email_password_reset",
    name: "password-reset-email",
    label: "Password Reset (Email)",
    description:
      "Password reset email for customers or admin users on auth.password_reset.",
    channel: "email",
    mode: "blocks",
    default_event: "auth.password_reset",
    subject: "Reset your password for {{data.store_name}}",
    blocks: [
      {
        id: "blk_pwr_1",
        type: "heading",
        position: 0,
        parent_id: null,
        metadata: { level: 1, align: "center", text: "Password Reset" },
      },
      {
        id: "blk_pwr_2",
        type: "text",
        position: 1,
        parent_id: null,
        metadata: {
          align: "left",
          text: "We received a request to reset your password. If you did not request this, you can safely ignore this email.",
        },
      },
      {
        id: "blk_pwr_3",
        type: "button",
        position: 2,
        parent_id: null,
        metadata: { text: "Reset Password", url: "{{data.reset_url}}" },
      },
    ],
  },
  {
    id: "system_email_verification",
    name: "email-verification-email",
    label: "Email Verification Code (Email)",
    description:
      "Email verification code message triggered on auth.verification_requested.",
    channel: "email",
    mode: "blocks",
    default_event: "auth.verification_requested",
    subject: "Verify your email address",
    blocks: [
      {
        id: "blk_ver_1",
        type: "heading",
        position: 0,
        parent_id: null,
        metadata: { level: 1, align: "center", text: "Verify Your Email" },
      },
      {
        id: "blk_ver_2",
        type: "text",
        position: 1,
        parent_id: null,
        metadata: {
          align: "left",
          text: "Use the verification code below to confirm your email address: {{data.code}}",
        },
      },
    ],
  },
]
