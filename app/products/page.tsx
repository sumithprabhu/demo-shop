import type { Metadata } from "next";

import { AddToCartForm } from "../../components/AddToCartForm";
import { PRODUCTS } from "../../lib/catalog";
import { formatCents } from "../../lib/money";

export const metadata: Metadata = { title: "Products · Demo shop" };

export default function ProductsPage() {
  return (
    <>
      <h1>Products</h1>
      <ul className="products" aria-label="Products">
        {PRODUCTS.map((p) => (
          <li key={p.id} className="product">
            <span className="swatch large" style={{ background: p.color }} />
            <h2>{p.name}</h2>
            <p className="blurb">{p.blurb}</p>
            <p className="price">{formatCents(p.priceCents)}</p>
            <AddToCartForm id={p.id} name={p.name} />
          </li>
        ))}
      </ul>
    </>
  );
}
