import { expect, test, type Page } from "@playwright/test";

import { cartSaved, chartColorAt, signedHookCall } from "./helpers";

const DISCOUNT = "#16a34a";
const MUG = "#f59e0b";
// With the $5.00 discount on the $50.00 seed cart, the slices are tote $30, mug $20 and the
// discount $5 of $55 in all: the discount is the last slice, about 327°–360°.
const DISCOUNT_SLICE = 344;

async function applyCode(page: Page, code: string): Promise<void> {
  await page.getByRole("textbox", { name: "Discount code" }).fill(code);
  await page.getByRole("button", { name: "Apply" }).click();
}

test("SAVE10 adds a −$5.00 discount line", async ({ page }) => {
  await page.goto("/cart");
  await applyCode(page, "SAVE10");
  await expect(page.getByTestId("discount-line")).toHaveText(/Discount \(SAVE10\)\s*−\$5\.00/);
});

test("the discount survives a reload", async ({ page }) => {
  await page.goto("/cart");
  const saved = cartSaved(page);
  await applyCode(page, "SAVE10");
  await saved;
  await page.reload();
  await expect(page.getByTestId("discount-line")).toBeVisible();
  await expect(page.getByTestId("total")).toHaveText("$45.00");
});

test("the savings chart shows the discount slice", async ({ page }) => {
  await page.goto("/cart");
  await expect.poll(() => chartColorAt(page, DISCOUNT_SLICE)).toBe(MUG);
  await applyCode(page, "SAVE10");
  await expect.poll(() => chartColorAt(page, DISCOUNT_SLICE)).toBe(DISCOUNT);
});

test("OLD5 shows 'This code has expired' and changes nothing", async ({ page }) => {
  await page.goto("/cart");
  await applyCode(page, "OLD5");
  // Not just getByRole("alert"): Next.js keeps an empty role=alert route announcer on every page.
  await expect(page.getByRole("alert").filter({ hasText: "This code has expired" })).toBeVisible();
  await expect(page.getByTestId("total")).toHaveText("$50.00");
  await expect(page.getByTestId("discount-line")).toHaveCount(0);
});

test("an unknown code is refused", async ({ page }) => {
  await page.goto("/cart");
  await applyCode(page, "FREE100");
  await expect(page.getByRole("alert").filter({ hasText: "This code is not valid" })).toBeVisible();
  await expect(page.getByTestId("total")).toHaveText("$50.00");
});

test("a new shopper from the session hook starts without the code", async ({ page, context }) => {
  await page.goto("/cart");
  const saved = cartSaved(page);
  await applyCode(page, "SAVE10");
  await saved;
  expect((await context.request.post("/api/test/session", signedHookCall())).status()).toBe(200);
  await page.reload();
  await expect(page.getByTestId("discount-line")).toHaveCount(0);
  await expect(page.getByTestId("total")).toHaveText("$50.00");
});
