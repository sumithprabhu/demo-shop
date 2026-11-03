import { describe, expect, it } from "vitest";

import { checkCode, discountCents, savedCode } from "./discounts";

describe("discount codes", () => {
  it("accepts SAVE10 for 10% off, whatever the case and spacing", () => {
    expect(checkCode("SAVE10")).toEqual({ ok: true, code: "SAVE10", percent: 10 });
    expect(checkCode("  save10 ")).toEqual({ ok: true, code: "SAVE10", percent: 10 });
  });

  it("refuses OLD5, which has expired, and unknown codes", () => {
    expect(checkCode("OLD5")).toEqual({ ok: false, error: "This code has expired" });
    expect(checkCode("FREE100")).toEqual({ ok: false, error: "This code is not valid" });
    expect(checkCode("toString")).toEqual({ ok: false, error: "This code is not valid" });
  });

  it("only restores a still-valid code from the cookie", () => {
    expect(savedCode("SAVE10")).toBe("SAVE10");
    expect(savedCode("OLD5")).toBeNull();
    expect(savedCode(undefined)).toBeNull();
  });

  it("rounds the discount to the cent", () => {
    expect(discountCents(5000, 10)).toBe(500);
    expect(discountCents(4995, 10)).toBe(500);
    expect(discountCents(4994, 10)).toBe(499);
  });
});
