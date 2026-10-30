import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CartView } from "../../components/CartView";
import { CART_COOKIE, parseCart } from "../../lib/cart";
import { DISCOUNT_COOKIE, savedCode } from "../../lib/discounts";

export const metadata: Metadata = { title: "Cart · Demo shop" };

export default async function CartPage() {
  const store = await cookies();
  const lines = parseCart(store.get(CART_COOKIE)?.value);
  const code = savedCode(store.get(DISCOUNT_COOKIE)?.value);
  return (
    <>
      <h1>Your cart</h1>
      <CartView initial={lines} initialCode={code} />
    </>
  );
}
