import { expect, test } from "@playwright/test";

import { cartSaved, chartColorAt } from "./helpers";

const TOTE = "#2563eb";
const MUG = "#f59e0b";
const APRON = "#8b5cf6";

test.describe("a new shopper's cart", () => {
  test("holds the tote and the mug: $50.00, with a Continue button", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByRole("list", { name: "Cart items" }).getByRole("listitem")).toHaveCount(
      2,
    );
    await expect(page.getByTestId("subtotal")).toHaveText("$50.00");
    await expect(page.getByTestId("total")).toHaveText("$50.00");
    await expect(page.getByRole("link", { name: "Continue" })).toBeVisible();
    await expect(page.getByText("Guest")).toBeVisible();
  });

  test("draws the savings chart from the line items", async ({ page }) => {
    await page.goto("/cart");
    // The tote is 60% of the order, from 12 o'clock clockwise; the mug the remaining 40%.
    await expect.poll(() => chartColorAt(page, 90)).toBe(TOTE);
    expect(await chartColorAt(page, 270)).toBe(MUG);
  });
});

test("adding a product shows a toast and updates the cart and the chart", async ({ page }) => {
  await page.goto("/products");
  await page.getByRole("button", { name: "Add Linen apron to cart" }).click();
  await expect(page.getByRole("status")).toHaveText("Added Linen apron to your cart");
  await expect(page.getByRole("link", { name: "Cart (3)" })).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByTestId("total")).toHaveText("$75.00");
  // $30 + $20 + $25: the apron's slice is the last third, 240°–360°.
  await expect.poll(() => chartColorAt(page, 300)).toBe(APRON);
});

test("a quantity change updates the total at once and survives a reload", async ({ page }) => {
  await page.goto("/cart");
  const saved = cartSaved(page);
  await page.getByRole("button", { name: "Increase quantity of Ceramic mug" }).click();
  await expect(page.getByTestId("qty-mug")).toHaveText("2");
  await expect(page.getByTestId("total")).toHaveText("$70.00");
  await saved;
  await page.reload();
  await expect(page.getByTestId("total")).toHaveText("$70.00");
});

test("removing every line empties the cart, and it stays empty", async ({ page }) => {
  await page.goto("/cart");
  const saved = cartSaved(page, 2); // both removals, armed before the first one
  await page.getByRole("button", { name: "Remove Canvas tote bag" }).click();
  await expect(page.getByTestId("total")).toHaveText("$20.00");
  await page.getByRole("button", { name: "Remove Ceramic mug" }).click();
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
  await saved;
  await page.reload();
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
});

test("checkout is a placeholder that charges nothing", async ({ page }) => {
  await page.goto("/cart");
  await page.getByRole("link", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  await expect(page.getByText("nothing is ever charged")).toBeVisible();
});
