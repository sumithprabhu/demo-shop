import { describe, expect, it } from "vitest";

import { applyDiscountCode, discountCentsFor, discountLabel, normalizeCode } from "./discount";

describe("discount codes", () => {
  it("SAVE10 takes 10% off the subtotal: $50.00 → $5.00 off", () => {
    expect(discountCentsFor("SAVE10", 5000)).toBe(500);
    expect(discountLabel("SAVE10")).toBe("Discount (SAVE10)");
  });

  it("recalculates from the current subtotal", () => {
    expect(discountCentsFor("SAVE10", 7000)).toBe(700);
    expect(discountCentsFor("SAVE10", 333)).toBe(33);
  });

  it("accepts SAVE10 with surrounding spaces or lowercase", () => {
    expect(normalizeCode(" save10 ")).toBe("SAVE10");
    expect(applyDiscountCode(" save10 ", 5000)).toEqual({
      ok: true,
      code: "SAVE10",
      discountCents: 500,
    });
  });

  it("rejects the expired code OLD5 with the exact message", () => {
    expect(applyDiscountCode("OLD5", 5000)).toEqual({
      ok: false,
      error: "This code has expired",
    });
  });

  it("rejects unknown codes without a discount", () => {
    const result = applyDiscountCode("NOPE", 5000);
    expect(result.ok).toBe(false);
    expect(discountCentsFor("NOPE", 5000)).toBe(0);
  });
});
