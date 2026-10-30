import { describe, expect, it } from "vitest";

import { slicesOf } from "./chart";

describe("the savings chart's slices", () => {
  it("start at 12 o'clock and share the circle in proportion, in line order", () => {
    const [tote, mug] = slicesOf([
      { label: "tote", color: "blue", cents: 3000 },
      { label: "mug", color: "amber", cents: 2000 },
    ]);
    expect(tote!.start).toBeCloseTo(-Math.PI / 2);
    expect(tote!.end - tote!.start).toBeCloseTo(0.6 * 2 * Math.PI);
    expect(mug!.start).toBeCloseTo(tote!.end);
    expect(mug!.end).toBeCloseTo(-Math.PI / 2 + 2 * Math.PI);
  });

  it("sizes negative lines (a future discount) by their amount", () => {
    const slices = slicesOf([
      { label: "items", color: "blue", cents: 4500 },
      { label: "saved", color: "green", cents: -500 },
    ]);
    expect(slices[1]!.end - slices[1]!.start).toBeCloseTo(0.1 * 2 * Math.PI);
  });

  it("has no slices for an empty cart", () => {
    expect(slicesOf([])).toEqual([]);
  });
});
