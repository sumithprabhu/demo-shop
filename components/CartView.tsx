"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { saveCart } from "../app/actions";
import { priceCart, setQuantity, type CartLine } from "../lib/cart";
import { applyDiscountCode, discountCentsFor, discountLabel } from "../lib/discount";
import { formatCents } from "../lib/money";
import { SavingsChart } from "./SavingsChart";

// The cart updates at once from local state (lines, totals and the chart), and saves to the
// cart cookie in the background, so a reload shows the same cart.
export function CartView({ initial }: { initial: CartLine[] }) {
  const [lines, setLines] = useState(initial);
  const [, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cart = priceCart(lines);
  const discountCents = applied ? discountCentsFor(applied, cart.subtotalCents) : 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const totalCents = useMemo(() => cart.subtotalCents - discountCents, [lines]);
  const change = (next: CartLine[]) => {
    setLines(next);
    startTransition(() => saveCart(next));
  };
  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    if (code.trim() === "") return;
    const result = applyDiscountCode(code, cart.subtotalCents);
    if (result.ok) {
      setApplied(result.code);
      setError(null);
    } else {
      setError(result.error);
    }
  };

  if (cart.lines.length === 0) {
    return (
      <p className="empty">
        Your cart is empty. <Link href="/products">Browse products</Link>
      </p>
    );
  }

  return (
    <div className="cart">
      <div>
        <ul className="lines" aria-label="Cart items">
          {cart.lines.map((l) => (
            <li key={l.id} className="line" data-testid={`cart-line-${l.id}`}>
              <span className="swatch" style={{ background: l.color }} />
              <span className="name">{l.name}</span>
              <span className="qty">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${l.name}`}
                  onClick={() => change(setQuantity(lines, l.id, l.qty - 1))}
                >
                  −
                </button>
                <span data-testid={`qty-${l.id}`}>{l.qty}</span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${l.name}`}
                  onClick={() => change(setQuantity(lines, l.id, l.qty + 1))}
                >
                  +
                </button>
              </span>
              <span className="price">{formatCents(l.totalCents)}</span>
              <button
                type="button"
                className="remove"
                aria-label={`Remove ${l.name}`}
                onClick={() => change(setQuantity(lines, l.id, 0))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form className="discount" onSubmit={apply}>
          <label htmlFor="discount-code">Discount code</label>
          <input
            id="discount-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="off"
          />
          <button type="submit">Apply</button>
          {error && (
            <p role="alert" className="discount-error" data-testid="discount-error">
              {error}
            </p>
          )}
        </form>
      </div>
      <section className="summary" aria-label="Order summary">
        <div className="row">
          <span>Subtotal</span>
          <span data-testid="subtotal">{formatCents(cart.subtotalCents)}</span>
        </div>
        {applied && discountCents > 0 && (
          <div className="row">
            <span>{discountLabel(applied)}</span>
            <span data-testid="discount">{formatCents(-discountCents)}</span>
          </div>
        )}
        <div className="row total">
          <span>Total</span>
          <span data-testid="total">{formatCents(totalCents)}</span>
        </div>
        <SavingsChart
          lines={cart.lines}
          discount={
            applied && discountCents > 0
              ? { label: discountLabel(applied), cents: -discountCents }
              : undefined
          }
        />
        <Link href="/checkout" className="button">
          Checkout
        </Link>
      </section>
    </div>
  );
}
