export const PRODUCTS = [
  {
    id: "tote",
    name: "Canvas tote bag",
    priceCents: 3000,
    color: "#2563eb",
    blurb: "Heavy cotton canvas. Fits a laptop.",
  },
  {
    id: "mug",
    name: "Ceramic mug",
    priceCents: 2000,
    color: "#f59e0b",
    blurb: "Stoneware, 350 ml, dishwasher safe.",
  },
  {
    id: "apron",
    name: "Linen apron",
    priceCents: 2500,
    color: "#8b5cf6",
    blurb: "Washed linen with two deep pockets.",
  },
  {
    id: "pin",
    name: "Enamel pin",
    priceCents: 500,
    color: "#ec4899",
    blurb: "Hard enamel with a butterfly clasp.",
  },
] as const;

export type Product = (typeof PRODUCTS)[number];
export type ProductId = Product["id"];

export function productById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
