"use client";

import { useEffect, useRef } from "react";

import type { PricedLine } from "../lib/cart";
import { CHART, slicesOf } from "../lib/chart";
import { formatCents } from "../lib/money";

// A canvas donut of the order, fed by the line items. Its content is pixels only: nothing in the
// DOM or the accessibility tree says what's in it, which is what makes it a ui_visual target.
export function SavingsChart({ lines }: { lines: readonly PricedLine[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const { size, outer, inner, empty } = CHART;
    const c = size / 2;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    const slices = slicesOf(
      lines.map((l) => ({ label: l.name, color: l.color, cents: l.totalCents })),
    );
    for (const s of slices.length > 0 ? slices : [{ start: 0, end: 2 * Math.PI, color: empty }]) {
      ctx.beginPath();
      ctx.arc(c, c, outer, s.start, s.end);
      ctx.arc(c, c, inner, s.end, s.start, true);
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();
    }
  }, [lines]);
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
          {lines.map((l) => (
            <li key={l.id}>
              <span className="dot" style={{ background: l.color }} /> {l.name}{" "}
              {formatCents(l.totalCents)}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
