---
"@vicacha-devs/medusa-plugin-automations": patch
---

Restore the `@medusajs/admin-shared` dev and peer dependency; the generated admin extension imports it, so clean installs (CI) failed to build.
