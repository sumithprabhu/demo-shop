"use server";

import { cookies } from "next/headers";

import {
  addLine,
  CART_COOKIE,
  MAX_QTY,
  parseCart,
  serializeCart,
  type CartLine,
} from "../lib/cart";
import { productById } from "../lib/catalog";

const COOKIE = { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 } as const;

export type AddResult = { message: string; at: number } | { error: string } | null;

export async function addToCart(_previous: AddResult, form: FormData): Promise<AddResult> {
  const product = productById(String(form.get("id") ?? ""));
  if (!product) return { error: "That product doesn't exist." };
  const store = await cookies();
  const current = parseCart(store.get(CART_COOKIE)?.value);
  if ((current.find((l) => l.id === product.id)?.qty ?? 0) >= MAX_QTY) {
    return { error: "You can buy at most 5 of this item" };
  }
  const lines = addLine(current, product.id);
  store.set(CART_COOKIE, serializeCart(lines), COOKIE);
  return { message: `Added ${product.name} to your cart`, at: Date.now() };
}

/** Persists the cart page's changes. The page already shows them; this keeps them on reload. */
export async function saveCart(lines: CartLine[]): Promise<void> {
  // Round-trip through the parser so a crafted call can't store an unknown product.
  const clean = parseCart(serializeCart(lines));
  (await cookies()).set(CART_COOKIE, serializeCart(clean), COOKIE);
}
