import type { Metadata } from "next";
import type { CSSProperties } from "react";

import { AddToCartForm } from "../../components/AddToCartForm";
import { ProductArt } from "../../components/ProductArt";
import { PRODUCTS } from "../../lib/catalog";
import { formatCents } from "../../lib/money";

export const metadata: Metadata = { title: "Products · Kiln & Canvas" };

export default function ProductsPage() {
  return (
    <>
      <h1>Products</h1>
      <p className="lede">Small-batch goods, made to be used every day.</p>
      <ul className="products" aria-label="Products">
        {PRODUCTS.map((p) => (
          <li key={p.id} className="product">
            <span className="art-tile" style={{ "--tint": p.color } as CSSProperties}>
              <ProductArt id={p.id} color={p.color} />
            </span>
            <h2>{p.name}</h2>
            <p className="blurb">{p.blurb}</p>
            <div className="buy">
              <p className="price">{formatCents(p.priceCents)}</p>
              <AddToCartForm id={p.id} name={p.name} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
