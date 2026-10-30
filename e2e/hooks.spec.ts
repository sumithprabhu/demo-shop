import { expect, test } from "@playwright/test";

import { signedHookCall } from "./helpers";

// The test hooks through real HTTP, the way Intenzo calls them: from the browser context's own
// request client, so the cookies they set land in that context.

test("the session hook gives every call a new shopper with a fresh cart", async ({
  page,
  context,
}) => {
  await page.goto("/products");
  await page.getByRole("button", { name: "Add Enamel pin to cart" }).click();
  await expect(page.getByRole("link", { name: "Cart (3)" })).toBeVisible();

  const first = await context.request.post("/api/test/session", signedHookCall());
  expect(first.status()).toBe(200);
  const { shopper } = (await first.json()) as { shopper: string };
  expect(shopper).toMatch(/^shopper-[0-9a-f]{6}$/);

  await page.goto("/cart");
  await expect(page.getByText(`Signed in as ${shopper}`)).toBeVisible();
  await expect(page.getByTestId("total")).toHaveText("$50.00");

  const second = await context.request.post("/api/test/session", signedHookCall());
  expect(((await second.json()) as { shopper: string }).shopper).not.toBe(shopper);
});

test("the reset hook puts the cart back to a new shopper's", async ({ page, context }) => {
  await page.goto("/products");
  await page.getByRole("button", { name: "Add Linen apron to cart" }).click();
  await expect(page.getByRole("link", { name: "Cart (3)" })).toBeVisible();
  expect((await context.request.post("/api/test/reset", signedHookCall())).status()).toBe(200);
  await page.goto("/cart");
  await expect(page.getByTestId("total")).toHaveText("$50.00");
});

test("the hooks refuse an unsigned or wrongly signed call", async ({ request }) => {
  for (const path of ["/api/test/session", "/api/test/reset"]) {
    expect((await request.post(path, signedHookCall("not-the-secret"))).status()).toBe(401);
    expect((await request.post(path, { data: "{}" })).status()).toBe(401);
  }
});
