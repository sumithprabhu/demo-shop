import { handleSessionHook } from "../../../../lib/hooks";

// Intenzo's session hook (ARCHITECTURE §21.1). See lib/hooks.ts for the contract.
export function POST(request: Request): Promise<Response> {
  return handleSessionHook(request, {
    secret: process.env.INTENZO_HOOK_SECRET,
    vercelEnv: process.env.VERCEL_ENV,
  });
}
