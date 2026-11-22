import { expect, test } from "@playwright/test"

test.describe("Medusa Plugins Sandbox — Health, Auth & Admin E2E", () => {
  test("GET /health returns 200 OK", async ({ request }) => {
    const res = await request.get("/health")
    expect(res.status()).toBe(200)
  })

  test("unauthenticated admin API requests are rejected with 401", async ({
    request,
  }) => {
    const res = await request.get("/admin/products")
    expect([401, 403]).toContain(res.status())
  })

  test("Medusa Admin UI (/app) renders cleanly without console errors", async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.goto("/app", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveTitle(/Medusa/i)
    const htmlLang = await page.locator("html").getAttribute("lang")
    expect(htmlLang ?? "en").toBeTruthy()
    expect(errors).toEqual([])
  })
})
