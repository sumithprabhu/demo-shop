"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import { saveCart } from "../app/actions";
import { priceCart, removeLine, restoreLine, setQuantity, type CartLine } from "../lib/cart";
import { formatCents } from "../lib/money";
import { SavingsChart } from "./SavingsChart";
import { useToast } from "./Toasts";

// The cart updates at once from local state (lines, totals and the chart), and saves to the
// cart cookie in the background, so a reload shows the same cart.
export function CartView({ initial }: { initial: CartLine[] }) {
  const [lines, setLines] = useState(initial);
  const [, startTransition] = useTransition();
  const toast = useToast();
  // The latest lines for the toast's Undo button, which outlives this render's closure.
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const cart = priceCart(lines);
  const change = (next: CartLine[]) => {
    setLines(next);
    startTransition(() => saveCart(next));
  };
  const remove = (id: CartLine["id"], name: string) => {
    const { next, removed } = removeLine(lines, id);
    if (!removed) return;
    change(next);
    toast({
      text: `Removed ${name}`,
      kind: "status",
      action: {
        label: "Undo",
        onAction: () => change(restoreLine(linesRef.current, removed)),
      },
    });
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
              onClick={() => remove(l.id, l.name)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <section className="summary" aria-label="Order summary">
        <div className="row">
          <span>Subtotal</span>
          <span data-testid="subtotal">{formatCents(cart.subtotalCents)}</span>
        </div>
        <div className="row total">
          <span>Total</span>
          <span data-testid="total">{formatCents(cart.totalCents)}</span>
        </div>
        <SavingsChart lines={cart.lines} />
        <Link href="/checkout" className="button">
          Checkout
        </Link>
      </section>
    </div>
  );
}
