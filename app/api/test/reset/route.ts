import { handleResetHook } from "../../../../lib/hooks";

// Intenzo's reset hook (ARCHITECTURE §21.1), for apps without a session hook.
export function POST(request: Request): Promise<Response> {
  return handleResetHook(request, {
    secret: process.env.INTENZO_HOOK_SECRET,
    vercelEnv: process.env.VERCEL_ENV,
  });
}
