"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type FormEvent } from "react";

import { saveCart, saveDiscount } from "../app/actions";
import { priceCart, setQuantity, type CartLine } from "../lib/cart";
import { checkCode, DISCOUNT_COLOR } from "../lib/discounts";
import { formatCents } from "../lib/money";
import { SavingsChart, type ChartItem } from "./SavingsChart";
import { useToast } from "./Toasts";

// The cart updates at once from local state (lines, discount, totals and the chart), and saves
// to cookies in the background, so a reload shows the same cart.
export function CartView({
  initial,
  initialCode,
}: {
  initial: CartLine[];
  initialCode: string | null;
}) {
  const [lines, setLines] = useState(initial);
  const [code, setCode] = useState(initialCode);
  const [draft, setDraft] = useState("");
  const [, startTransition] = useTransition();
  const toast = useToast();
  const cart = priceCart(lines, code);
  const total = useMemo(() => priceCart(lines, code).totalCents, [lines]);
  const chartItems = useMemo<ChartItem[]>(
    () => [
      ...cart.lines.map((l) => ({ id: l.id, label: l.name, color: l.color, cents: l.totalCents })),
      ...(cart.discount
        ? [
            {
              id: "discount",
              label: cart.discount.label,
              color: DISCOUNT_COLOR,
              cents: -cart.discount.amountCents,
            },
          ]
        : []),
    ],
    [cart.lines, cart.discount],
  );
  const change = (next: CartLine[]) => {
    setLines(next);
    startTransition(() => saveCart(next));
  };
  const apply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (draft.trim() === "") return;
    const check = checkCode(draft);
    if (!check.ok) {
      toast({ text: check.error, kind: "alert" });
      return;
    }
    setCode(check.code);
    setDraft("");
    startTransition(() => saveDiscount(check.code));
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
        <form className="discount" aria-label="Discount code" onSubmit={apply}>
          <label htmlFor="discount-code">Discount code</label>
          <input
            id="discount-code"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoComplete="off"
          />
          <button type="submit">Apply</button>
        </form>
      </div>
      <section className="summary" aria-label="Order summary">
        <div className="row">
          <span>Subtotal</span>
          <span data-testid="subtotal">{formatCents(cart.subtotalCents)}</span>
        </div>
        {cart.discount && (
          <div className="row discount-line" data-testid="discount-line">
            <span>{cart.discount.label}</span>
            <span>{formatCents(-cart.discount.amountCents)}</span>
          </div>
        )}
        <div className="row total">
          <span>Total</span>
          <span data-testid="total">{formatCents(total)}</span>
        </div>
        <SavingsChart items={chartItems} />
        <Link href="/checkout" className="button">
          Continue
        </Link>
      </section>
    </div>
  );
}
