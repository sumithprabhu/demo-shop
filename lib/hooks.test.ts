import { describe, expect, it } from "vitest";

import {
  handleResetHook,
  handleSessionHook,
  sign,
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  type HookEnv,
} from "./hooks";

const SECRET = "test-secret";
const NOW = 1_800_000_000;
const env = (over: Partial<HookEnv> = {}): HookEnv => ({
  secret: SECRET,
  vercelEnv: "preview",
  nowS: NOW,
  ...over,
});

function hookRequest(
  path: string,
  { timestamp = String(NOW), body = '{"nonce":"n1"}', signature = "", cookie = "" } = {},
): Request {
  return new Request(`https://shop.example${path}`, {
    method: "POST",
    headers: {
      [TIMESTAMP_HEADER]: timestamp,
      [SIGNATURE_HEADER]: signature || sign(SECRET, timestamp, body),
      ...(cookie && { cookie }),
    },
    body,
  });
}

describe("the session hook", () => {
  it("accepts a valid signature and makes a new shopper with a fresh cart", async () => {
    const res = await handleSessionHook(
      hookRequest("/api/test/session"),
      env({ newShopper: () => "shopper-abc123" }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ shopper: "shopper-abc123" });
    expect(res.headers.getSetCookie()).toEqual([
      "shopper=shopper-abc123; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800",
      "cart=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      "discount=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    ]);
  });

  it("gives every call a new shopper", async () => {
    const ids = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const res = await handleSessionHook(hookRequest("/api/test/session"), env());
      ids.add(((await res.json()) as { shopper: string }).shopper);
    }
    expect(ids.size).toBe(5);
    for (const id of ids) expect(id).toMatch(/^shopper-[0-9a-f]{6}$/);
  });

  it("refuses a bad signature with 401", async () => {
    const forged = hookRequest("/api/test/session", {
      signature: sign("wrong", String(NOW), "{}"),
    });
    const res = await handleSessionHook(forged, env());
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "bad signature" });
    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it("refuses a body that doesn't match its signature", async () => {
    const signed = sign(SECRET, String(NOW), '{"nonce":"n1"}');
    const tampered = hookRequest("/api/test/session", {
      body: '{"nonce":"n2"}',
      signature: signed,
    });
    expect((await handleSessionHook(tampered, env())).status).toBe(401);
  });

  it.each([
    ["older than 5 minutes", String(NOW - 301)],
    ["more than 5 minutes ahead", String(NOW + 301)],
    ["missing", ""],
    ["not a number", "yesterday"],
  ])("refuses a timestamp that's %s with 401", async (_, timestamp) => {
    const res = await handleSessionHook(hookRequest("/api/test/session", { timestamp }), env());
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "missing or stale timestamp" });
  });

  it("accepts a timestamp right at the 5-minute edge", async () => {
    const timestamp = String(NOW - 300);
    expect(
      (await handleSessionHook(hookRequest("/api/test/session", { timestamp }), env())).status,
    ).toBe(200);
  });

  it("refuses production with 403, even with a valid signature", async () => {
    const res = await handleSessionHook(
      hookRequest("/api/test/session"),
      env({ vercelEnv: "production" }),
    );
    expect(res.status).toBe(403);
    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it("is off (503) when no secret is configured", async () => {
    const res = await handleSessionHook(
      hookRequest("/api/test/session"),
      env({ secret: undefined }),
    );
    expect(res.status).toBe(503);
  });
});

describe("the reset hook", () => {
  it("clears the calling shopper's cart and discount code, and keeps the shopper", async () => {
    const res = await handleResetHook(
      hookRequest("/api/test/reset", { cookie: "shopper=shopper-abc123; cart=pin:3" }),
      env(),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ reset: true, shopper: "shopper-abc123" });
    expect(res.headers.getSetCookie()).toEqual([
      "cart=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      "discount=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    ]);
  });

  it("has the same guards as the session hook", async () => {
    const forged = hookRequest("/api/test/reset", { signature: "sha256=00" });
    expect((await handleResetHook(forged, env())).status).toBe(401);
    expect(
      (await handleResetHook(hookRequest("/api/test/reset"), env({ vercelEnv: "production" })))
        .status,
    ).toBe(403);
  });
});
