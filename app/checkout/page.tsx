import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Checkout · Demo shop" };

export default function CheckoutPage() {
  return (
    <>
      <h1>Checkout</h1>
      <p>Checkout isn&apos;t part of this demo, so nothing is ever charged.</p>
      <p>
        <Link href="/cart">Back to your cart</Link>
      </p>
    </>
  );
}
