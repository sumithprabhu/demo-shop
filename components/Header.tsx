import { cookies } from "next/headers";
import Link from "next/link";

import { CART_COOKIE, parseCart, priceCart } from "../lib/cart";
import { SHOPPER_COOKIE } from "../lib/hooks";

export async function Header() {
  const store = await cookies();
  const { count } = priceCart(parseCart(store.get(CART_COOKIE)?.value));
  const shopper = store.get(SHOPPER_COOKIE)?.value;
  return (
    <header className="site-header">
      <Link href="/products" className="brand">
        Demo shop
      </Link>
      <nav aria-label="Main">
        <Link href="/products">Products</Link>
        <Link href="/cart">Cart ({count})</Link>
      </nav>
      <span className="shopper">{shopper ? `Signed in as ${shopper}` : "Guest"}</span>
    </header>
  );
}
