"use client";

import { useActionState, useEffect } from "react";

import { addToCart, type AddResult } from "../app/actions";
import { useToast } from "./Toasts";

export function AddToCartForm({ id, name }: { id: string; name: string }) {
  const [result, action, pending] = useActionState<AddResult, FormData>(addToCart, null);
  const toast = useToast();
  useEffect(() => {
    if (result && "message" in result) toast({ text: result.message, kind: "status" });
    if (result && "error" in result) toast({ text: result.error, kind: "alert" });
  }, [result, toast]);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} aria-label={`Add ${name} to cart`}>
        Add to cart
      </button>
    </form>
  );
}
