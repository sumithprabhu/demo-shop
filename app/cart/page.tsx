import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CartView } from "../../components/CartView";
import { CART_COOKIE, parseCart } from "../../lib/cart";

export const metadata: Metadata = { title: "Cart · Demo shop" };

export default async function CartPage() {
  const lines = parseCart((await cookies()).get(CART_COOKIE)?.value);
  return (
    <>
      <h1>Your cart</h1>
      <CartView initial={lines} />
    </>
  );
}
