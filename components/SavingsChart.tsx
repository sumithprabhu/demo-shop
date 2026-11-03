"use client";

import { useEffect, useRef } from "react";

import { CHART, slicesOf, type ChartInput } from "../lib/chart";
import { formatCents } from "../lib/money";

export interface ChartItem extends ChartInput {
  id: string;
}

// A canvas donut of the order, fed by the line items (a discount line is a slice too). Its
// content is pixels only: nothing in the DOM or the accessibility tree says what's in it, which
// is what makes it a ui_visual target.
export function SavingsChart({ items }: { items: readonly ChartItem[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const { size, outer, inner, empty } = CHART;
    const c = size / 2;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    const slices = slicesOf(items);
    for (const s of slices.length > 0 ? slices : [{ start: 0, end: 2 * Math.PI, color: empty }]) {
      ctx.beginPath();
      ctx.arc(c, c, outer, s.start, s.end);
      ctx.arc(c, c, inner, s.end, s.start, true);
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();
    }
  }, [items]);
  return (
    <figure className="chart">
      <canvas
        ref={canvas}
        width={CHART.size}
        height={CHART.size}
        role="img"
        aria-label="Savings chart"
        data-testid="savings-chart"
      />
      <figcaption>
        <ul className="legend">
          {items.map((item) => (
            <li key={item.id}>
              <span className="dot" style={{ background: item.color }} /> {item.label}{" "}
              {formatCents(item.cents)}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
