import { createHmac, randomUUID } from "node:crypto";

import type { Page, Response } from "@playwright/test";

import { CHART } from "../lib/chart";

/** The color of the savings chart at an angle (degrees clockwise from 12 o'clock), as #rrggbb. */
export async function chartColorAt(page: Page, degrees: number): Promise<string> {
  const r = (CHART.outer + CHART.inner) / 2;
  const a = (degrees * Math.PI) / 180;
  const x = Math.round(CHART.size / 2 + r * Math.sin(a));
  const y = Math.round(CHART.size / 2 - r * Math.cos(a));
  return page.getByTestId("savings-chart").evaluate(
    (canvas, [px, py]) => {
      const [red, green, blue] = (canvas as HTMLCanvasElement)
        .getContext("2d")!
        .getImageData(px!, py!, 1, 1).data;
      return `#${[red, green, blue].map((v) => v!.toString(16).padStart(2, "0")).join("")}`;
    },
    [x, y],
  );
}

/** A request signed the way Intenzo signs hook calls (lib/hooks.ts). */
export function signedHookCall(secret = process.env.INTENZO_HOOK_SECRET!) {
  const data = JSON.stringify({ nonce: randomUUID() });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = `sha256=${createHmac("sha256", secret)
    .update(timestamp + data)
    .digest("hex")}`;
  return {
    data,
    headers: {
      "content-type": "application/json",
      "x-intenzo-timestamp": timestamp,
      "x-intenzo-signature": signature,
    },
  };
}

/**
 * Resolves once the cart page's next `count` background saves (Server Action POSTs) have answered.
 * Arm it before the first change: Next runs Server Actions one at a time, so after `count` answers
 * the cookie holds the last change.
 */
export function cartSaved(page: Page, count = 1): Promise<void> {
  let answered = 0;
  return new Promise((resolve) => {
    const onResponse = (response: Response) => {
      const request = response.request();
      if (request.method() !== "POST" || !request.headers()["next-action"]) return;
      if (++answered < count) return;
      page.off("response", onResponse);
      resolve();
    };
    page.on("response", onResponse);
  });
}
