import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { CART_COOKIE } from "./cart";

// The Intenzo test hooks (ARCHITECTURE §21.1), the reference implementation: every call to the
// session hook makes a brand-new shopper with a fresh cart, so each recording gets its own state.
//
//   POST /api/test/session   {"nonce":"…"}   → 200 {"shopper":"shopper-1a2b3c"} + Set-Cookie
//   POST /api/test/reset     {"nonce":"…"}   → 200 {"reset":true,…} + Set-Cookie (cart back to new)
//
// Both need X-Intenzo-Timestamp (unix seconds, within 5 minutes of now) and
// X-Intenzo-Signature: sha256=<hex HMAC-SHA256(INTENZO_HOOK_SECRET, timestamp + body)>.
// Both refuse outright on production (VERCEL_ENV=production), signed or not.

export const SIGNATURE_HEADER = "x-intenzo-signature";
export const TIMESTAMP_HEADER = "x-intenzo-timestamp";
export const SHOPPER_COOKIE = "shopper";
export const MAX_SKEW_S = 300;

export interface HookEnv {
  secret: string | undefined;
  vercelEnv: string | undefined;
  /** Injected in tests; defaults to the clock. */
  nowS?: number;
  /** Injected in tests; defaults to a random shopper id. */
  newShopper?: () => string;
}

export function sign(secret: string, timestamp: string, body: string): string {
  return `sha256=${createHmac("sha256", secret)
    .update(timestamp + body)
    .digest("hex")}`;
}

export const newShopperId = (): string => `shopper-${randomBytes(3).toString("hex")}`;

type Check = { ok: true } | { ok: false; status: number; error: string };

async function check(request: Request, env: HookEnv): Promise<Check & { body?: string }> {
  // Production first: a valid signature must not open a production deployment either.
  if (env.vercelEnv === "production") {
    return { ok: false, status: 403, error: "test hooks are disabled in production" };
  }
  if (!env.secret) return { ok: false, status: 503, error: "INTENZO_HOOK_SECRET is not set" };
  const timestamp = request.headers.get(TIMESTAMP_HEADER) ?? "";
  const nowS = env.nowS ?? Math.floor(Date.now() / 1000);
  if (!/^\d{1,12}$/.test(timestamp) || Math.abs(nowS - Number(timestamp)) > MAX_SKEW_S) {
    return { ok: false, status: 401, error: "missing or stale timestamp" };
  }
  const body = await request.text();
  const expected = Buffer.from(sign(env.secret, timestamp, body));
  const given = Buffer.from(request.headers.get(SIGNATURE_HEADER) ?? "");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, status: 401, error: "bad signature" };
  }
  return { ok: true, body };
}

function cookie(name: string, value: string, maxAgeS: number): string {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeS}`;
}

const WEEK_S = 60 * 60 * 24 * 7;

function json(status: number, data: unknown, cookies: string[] = []): Response {
  const headers = new Headers({ "content-type": "application/json", "cache-control": "no-store" });
  for (const c of cookies) headers.append("set-cookie", c);
  return new Response(JSON.stringify(data), { status, headers });
}

/** A new shopper and a fresh cart (the seed cart: no cart cookie). */
export async function handleSessionHook(request: Request, env: HookEnv): Promise<Response> {
  const result = await check(request, env);
  if (!result.ok) return json(result.status, { error: result.error });
  const shopper = (env.newShopper ?? newShopperId)();
  return json(200, { shopper }, [
    cookie(SHOPPER_COOKIE, shopper, WEEK_S),
    cookie(CART_COOKIE, "", 0),
  ]);
}

/** The calling shopper's cart back to a new shopper's (used when there's no session hook). */
export async function handleResetHook(request: Request, env: HookEnv): Promise<Response> {
  const result = await check(request, env);
  if (!result.ok) return json(result.status, { error: result.error });
  const shopper = /(?:^|;\s*)shopper=([^;]+)/.exec(request.headers.get("cookie") ?? "")?.[1];
  return json(200, { reset: true, shopper: shopper ?? null }, [cookie(CART_COOKIE, "", 0)]);
}
