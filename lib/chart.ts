// Geometry for the savings chart: a donut fed by the cart's line items, one slice per line,
// starting at 12 o'clock and going clockwise in line order. Pure, so it's unit-tested; the
// component only paints these slices onto the canvas.

export interface ChartInput {
  label: string;
  color: string;
  cents: number;
}

export interface Slice extends ChartInput {
  /** Radians, canvas convention (0 = 3 o'clock, clockwise). */
  start: number;
  end: number;
}

export const CHART = { size: 240, outer: 110, inner: 62, empty: "#e5e7eb" } as const;

const TOP = -Math.PI / 2;

export function slicesOf(items: readonly ChartInput[]): Slice[] {
  const total = items.reduce((sum, i) => sum + Math.abs(i.cents), 0);
  if (total === 0) return [];
  let start = TOP;
  return items.map((item) => {
    const end = start + (Math.abs(item.cents) / total) * 2 * Math.PI;
    const slice = { ...item, start, end };
    start = end;
    return slice;
  });
}
