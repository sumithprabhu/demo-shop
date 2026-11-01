import { describe, expect, it } from "vitest";

import {
  addLine,
  parseCart,
  priceCart,
  SEED_CART,
  serializeCart,
  setQuantity,
  shippingMessage,
} from "./cart";
import { formatCents } from "./money";

describe("the cart cookie", () => {
  it("gives a new shopper (no cookie) the $50.00 seed cart", () => {
    expect(parseCart(undefined)).toEqual(SEED_CART);
    expect(priceCart(parseCart(undefined)).subtotalCents).toBe(5000);
  });

  it("round-trips lines, and an empty cart", () => {
    const lines = [
      { id: "pin", qty: 3 },
      { id: "tote", qty: 1 },
    ] as const;
    expect(serializeCart(lines)).toBe("pin:3|tote:1");
    expect(parseCart("pin:3|tote:1")).toEqual(lines);
    expect(serializeCart([])).toBe("-");
    expect(parseCart("-")).toEqual([]);
  });

  it.each(["shoe:1", "tote:0", "tote:x", "tote:1|tote:2", "garbage", ""])(
    "falls back to the seed cart for a damaged cookie: %j",
    (raw) => {
      expect(parseCart(raw)).toEqual(SEED_CART);
    },
  );

  it("caps quantities at 9", () => {
    expect(parseCart("mug:40")).toEqual([{ id: "mug", qty: 9 }]);
  });
});

describe("cart changes", () => {
  it("adds a new line, or one more of an existing line", () => {
    expect(addLine(SEED_CART, "apron")).toEqual([...SEED_CART, { id: "apron", qty: 1 }]);
    expect(addLine(SEED_CART, "mug")).toEqual([
      { id: "tote", qty: 1 },
      { id: "mug", qty: 2 },
    ]);
  });

  it("sets quantities, and removes a line at zero", () => {
    expect(setQuantity(SEED_CART, "mug", 3)).toEqual([
      { id: "tote", qty: 1 },
      { id: "mug", qty: 3 },
    ]);
    expect(setQuantity(SEED_CART, "mug", 0)).toEqual([{ id: "tote", qty: 1 }]);
    expect(setQuantity(SEED_CART, "mug", 12)[1]).toEqual({ id: "mug", qty: 9 });
  });
});

describe("priceCart", () => {
  it("prices every line and totals the cart", () => {
    const cart = priceCart([
      { id: "tote", qty: 1 },
      { id: "mug", qty: 2 },
    ]);
    expect(cart.lines.map((l) => [l.name, l.totalCents])).toEqual([
      ["Canvas tote bag", 3000],
      ["Ceramic mug", 4000],
    ]);
    expect([cart.count, cart.subtotalCents, cart.shippingCents, cart.totalCents]).toEqual([
      3, 7000, 500, 7500,
    ]);
  });
});

describe("free shipping", () => {
  it("charges $5.00 below $75.00: $55.00 total for the $50.00 seed cart", () => {
    const cart = priceCart(SEED_CART);
    expect([cart.subtotalCents, cart.shippingCents, cart.totalCents]).toEqual([5000, 500, 5500]);
  });

  it("ships free at exactly $75.00", () => {
    const cart = priceCart([{ id: "apron", qty: 3 }]);
    expect([cart.subtotalCents, cart.shippingCents, cart.totalCents]).toEqual([7500, 0, 7500]);
  });

  it("ships free above $75.00, with the total just the subtotal", () => {
    const cart = priceCart([
      { id: "tote", qty: 2 },
      { id: "mug", qty: 1 },
    ]);
    expect([cart.subtotalCents, cart.shippingCents, cart.totalCents]).toEqual([8000, 0, 8000]);
  });

  it("says how much more is needed below $75.00", () => {
    expect(shippingMessage(5000)).toBe("Add $25.00 more for free shipping");
    expect(shippingMessage(7000)).toBe("Add $5.00 more for free shipping");
  });

  it("celebrates free shipping at $75.00 or more", () => {
    expect(shippingMessage(7500)).toBe("You've got free shipping!");
    expect(shippingMessage(8000)).toBe("You've got free shipping!");
  });
});

describe("formatCents", () => {
  it.each([
    [5000, "$50.00"],
    [4501, "$45.01"],
    [5, "$0.05"],
    [-500, "−$5.00"],
    [123456, "$1,234.56"],
  ])("%i → %s", (cents, text) => {
    expect(formatCents(cents)).toBe(text);
  });
});
