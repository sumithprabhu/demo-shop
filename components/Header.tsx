import { cookies } from "next/headers";
import Link from "next/link";

import { SHOPPER_COOKIE } from "../lib/hooks";

export async function Header() {
  const store = await cookies();
  const shopper = store.get(SHOPPER_COOKIE)?.value;
  return (
    <header className="site-header">
      <Link href="/products" className="brand">
        Demo shop
      </Link>
      <nav aria-label="Main">
        <Link href="/products">Products</Link>
        <Link href="/cart">Cart</Link>
      </nav>
      <span className="shopper">{shopper ? `Signed in as ${shopper}` : "Guest"}</span>
    </header>
  );
}
