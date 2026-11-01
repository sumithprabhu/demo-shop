// Discount codes for the cart page: SAVE10 takes 10% off the subtotal, OLD5 is expired.

export const DISCOUNT_COLOR = "#16a34a";

export const EXPIRED_MESSAGE = "This code has expired";
export const INVALID_MESSAGE = "Invalid code";

/** Uppercase and trimmed, so " save10 " still works. */
export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function discountPercentFor(code: string): number | null {
  return code === "SAVE10" ? 10 : null;
}

export function isExpiredCode(code: string): boolean {
  return code === "OLD5";
}

/** "Discount (SAVE10)". */
export function discountLabel(code: string): string {
  return `Discount (${code})`;
}

export function discountCentsFor(code: string, subtotalCents: number): number {
  const percent = discountPercentFor(code);
  if (percent === null) return 0;
  return Math.round((subtotalCents * percent) / 100);
}

export type DiscountApplied = { ok: true; code: string; discountCents: number };
export type DiscountRejected = { ok: false; error: string };
export type DiscountResult = DiscountApplied | DiscountRejected;

export function applyDiscountCode(raw: string, subtotalCents: number): DiscountResult {
  const code = normalizeCode(raw);
  if (isExpiredCode(code)) return { ok: false, error: EXPIRED_MESSAGE };
  const percent = discountPercentFor(code);
  if (percent === null) return { ok: false, error: INVALID_MESSAGE };
  return { ok: true, code, discountCents: discountCentsFor(code, subtotalCents) };
}
