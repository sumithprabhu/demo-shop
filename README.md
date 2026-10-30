# demo-shop

A small Next.js shop: the demo target that [Intenzo](https://github.com/0xNilesh/intenzo) verifies.
Intenzo watches PRs here, records each acceptance criterion on the PR's Vercel preview, and posts
what it saw.

- **`/products`:** four products, each with **Add to cart**. Adding one shows a toast.
- **`/cart`:**
  - line items with − / + / Remove
  - the **Order summary**: subtotal, **total**, a **canvas savings chart** fed by the line items, and **Checkout**
- **`/checkout`:** a placeholder. Nothing is ever charged.

`main` is the shop **without discount codes**: ticket #42 asks for them, and the demo PRs add them.

## Run it

```bash
nvm use && corepack enable pnpm && pnpm install
cp .env.example .env.local        # set INTENZO_HOOK_SECRET (openssl rand -hex 32)
pnpm dev                          # http://localhost:3000
pnpm check                        # typecheck + lint + format + unit tests
pnpm test:e2e                     # builds, starts on :3100 and runs the Playwright suite
```

E2E against a deployment, for example `main`'s Vercel preview:

```bash
BASE_URL=https://demo-shop-git-main-….vercel.app pnpm test:e2e
```

This needs that deployment's `INTENZO_HOOK_SECRET` and, because previews are protected, `VERCEL_AUTOMATION_BYPASS_SECRET`. Put both in `.env.local`.

## State and isolation

The cart lives in an HttpOnly cookie (`cart=tote:1|mug:1`), and the signed-in shopper in another (`shopper=shopper-1a2b3c`). Every browser context therefore has its own cart, and nothing is shared between shoppers. A shopper with no cart cookie gets the **seed cart**: the tote and the mug, **$50.00**.

## Test hooks (Intenzo's isolation contract, ARCHITECTURE §21.1)

| Route                    | Does                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `POST /api/test/session` | Makes a **new** shopper with a fresh seed cart. Returns `{"shopper":"shopper-…"}` and sets the cookies |
| `POST /api/test/reset`   | Puts the calling shopper's cart back to the seed cart                                                  |

Every call must be signed:

```
X-Intenzo-Timestamp: <unix seconds, within 5 minutes of the server's clock>
X-Intenzo-Signature: sha256=<hex HMAC-SHA256(INTENZO_HOOK_SECRET, timestamp + body)>
```

The body is the raw request body, e.g. `{"nonce":"…"}`. A bad signature or a stale timestamp gets **401**. The hooks always refuse with **403** when `VERCEL_ENV=production`, signed or not, and answer **503** when no secret is configured. See `lib/hooks.ts`, the reference implementation.

## Vercel setup

- **Production branch = `release`**, so `main` and every PR get _preview_ deployments. Intenzo compares a PR with the preview of its merge base, and never touches production.
- **Settings → Git → "deployment_status Events": on.** Without it, GitHub never sends `deployment_status`, and Intenzo can't see the previews (DECISIONS 2026-10-30, T0.4).
- **Environment variable `INTENZO_HOOK_SECRET`** for Preview (and Development). Don't set it for Production; the hooks refuse there anyway.
- **Deployment Protection stays on.** "Protection Bypass for Automation" gives the secret that tests and Intenzo use to reach previews.
