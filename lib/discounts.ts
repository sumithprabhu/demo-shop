// Discount codes for the cart (ticket #42). The cart checks a code in the browser, so the answer
// is instant, and the server checks it again before saving it.

export const DISCOUNT_COOKIE = "discount";
export const DISCOUNT_COLOR = "#16a34a";

const CODES: Record<string, { percent: number; expired: boolean }> = {
  SAVE10: { percent: 10, expired: false },
  OLD5: { percent: 5, expired: true },
};

export type CodeCheck = { ok: true; code: string; percent: number } | { ok: false; error: string };

export function checkCode(raw: string): CodeCheck {
  const code = raw.trim().toUpperCase();
  const known = Object.hasOwn(CODES, code) ? CODES[code] : undefined;
  if (!known) return { ok: false, error: "This code is not valid" };
  if (known.expired) return { ok: false, error: "This code has expired" };
  return { ok: true, code, percent: known.percent };
}

/** The code saved in the cookie, if it's still a valid one. */
export function savedCode(raw: string | undefined): string | null {
  if (!raw) return null;
  const check = checkCode(raw);
  return check.ok ? check.code : null;
}

export function discountCents(subtotalCents: number, percent: number): number {
  return Math.round((subtotalCents * percent) / 100);
}
