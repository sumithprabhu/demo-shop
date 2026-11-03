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
        <svg className="logo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path d="M5 28 V15 a11 11 0 0 1 22 0 V28 Z" fill="#1b1a17" />
          <path d="M12 28 V19 a4 4 0 0 1 8 0 V28 Z" fill="#f59e0b" />
        </svg>
        Kiln &amp; Canvas
      </Link>
      <nav aria-label="Main">
        <Link href="/products">Products</Link>
        <Link href="/cart" className="cart-link">
          Cart ({count})
        </Link>
      </nav>
      <span className="shopper">{shopper ? `Signed in as ${shopper}` : "Guest"}</span>
    </header>
  );
}
