import { productById, type ProductId } from "./catalog";

// The cart lives in a cookie, so every shopper identity (every browser context, every test-hook
// session) has its own cart and nothing is shared between them.

export const CART_COOKIE = "cart";
export const MAX_QTY = 9;

export interface CartLine {
  id: ProductId;
  qty: number;
}

/** A new shopper's cart: the tote and the mug, $50.00 in total. */
export const SEED_CART: readonly CartLine[] = [
  { id: "tote", qty: 1 },
  { id: "mug", qty: 1 },
];

const EMPTY = "-";

/** `tote:1|mug:2`, or `-` for an empty cart. Only cookie-safe characters. */
export function serializeCart(lines: readonly CartLine[]): string {
  return lines.length === 0 ? EMPTY : lines.map((l) => `${l.id}:${l.qty}`).join("|");
}

/** No cookie means a new shopper: the seed cart. A damaged cookie also falls back to it. */
export function parseCart(raw: string | undefined): CartLine[] {
  if (raw === undefined) return [...SEED_CART];
  if (raw === EMPTY) return [];
  const lines: CartLine[] = [];
  for (const part of raw.split("|")) {
    const [id = "", qty = ""] = part.split(":");
    const product = productById(id);
    const n = Number(qty);
    if (!product || !Number.isInteger(n) || n < 1 || lines.some((l) => l.id === product.id)) {
      return [...SEED_CART];
    }
    lines.push({ id: product.id, qty: Math.min(n, MAX_QTY) });
  }
  return lines;
}

export function addLine(lines: readonly CartLine[], id: ProductId): CartLine[] {
  const existing = lines.find((l) => l.id === id);
  if (!existing) return [...lines, { id, qty: 1 }];
  return setQuantity(lines, id, existing.qty + 1);
}

/** Sets a line's quantity, capped at MAX_QTY; 0 or less removes the line. */
export function setQuantity(lines: readonly CartLine[], id: ProductId, qty: number): CartLine[] {
  if (qty <= 0) return lines.filter((l) => l.id !== id);
  return lines.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, MAX_QTY) } : l));
}

/** A removed line, kept so "Undo" can put it back where it was. */
export interface RemovedLine {
  id: ProductId;
  qty: number;
  index: number;
}

/** Removes a line, keeping what "Undo" needs to restore it. Unknown id: no change. */
export function removeLine(
  lines: readonly CartLine[],
  id: ProductId,
): { next: CartLine[]; removed: RemovedLine | null } {
  const index = lines.findIndex((l) => l.id === id);
  if (index < 0) return { next: [...lines], removed: null };
  const line = lines[index]!;
  return {
    next: [...lines.slice(0, index), ...lines.slice(index + 1)],
    removed: { id: line.id, qty: line.qty, index },
  };
}

/** Puts a removed line back at its original position with its quantity. */
export function restoreLine(lines: readonly CartLine[], removed: RemovedLine): CartLine[] {
  if (lines.some((l) => l.id === removed.id)) return [...lines];
  const index = Math.max(0, Math.min(removed.index, lines.length));
  return [...lines.slice(0, index), { id: removed.id, qty: removed.qty }, ...lines.slice(index)];
}

export interface PricedLine {
  id: ProductId;
  name: string;
  color: string;
  unitCents: number;
  qty: number;
  totalCents: number;
}

export interface PricedCart {
  lines: PricedLine[];
  count: number;
  subtotalCents: number;
  totalCents: number;
}

export function priceCart(lines: readonly CartLine[]): PricedCart {
  const priced = lines.flatMap((l): PricedLine[] => {
    const product = productById(l.id);
    if (!product) return [];
    const { id, name, color, priceCents } = product;
    return [{ id, name, color, unitCents: priceCents, qty: l.qty, totalCents: priceCents * l.qty }];
  });
  const subtotalCents = priced.reduce((sum, l) => sum + l.totalCents, 0);
  return {
    lines: priced,
    count: priced.reduce((sum, l) => sum + l.qty, 0),
    subtotalCents,
    totalCents: subtotalCents,
  };
}
