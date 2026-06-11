// @ts-nocheck — This file runs in Deno (Supabase Edge Runtime), not Node.
// The `jsr:` imports and the `Deno` global only resolve in that runtime, so we
// disable the Node-based TypeScript checker here. It is excluded from the
// Next.js build via tsconfig and type-checked by Deno on deploy.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Password-protected media deletion.
 *
 * Supabase no longer allows deleting rows directly from `storage.objects`
 * ("Direct deletion from storage tables is not allowed. Use the Storage API
 * instead."). So this function verifies the admin password and then removes
 * the file through the Storage API using the service-role key.
 *
 * Auth: custom (admin password checked below). verify_jwt is disabled because
 * the browser client uses a publishable key (sb_publishable_...), which is not
 * a JWT and would be rejected by the gateway.
 *
 * Request body: { password: string, path: string }
 * Always responds with { ok: boolean, error?: string }.
 */
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MEDIA_BUCKET = "media";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { password, path } = await req.json().catch(() => ({}));
    if (typeof password !== "string" || typeof path !== "string" || !path) {
      return json({ ok: false, error: "Missing password or path." }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1) Verify the admin password against the existing DB function.
    const { data: ok, error: pwErr } = await admin.rpc("admin_check_password", {
      p_password: password,
    });
    if (pwErr) return json({ ok: false, error: pwErr.message }, 500);
    if (ok !== true) return json({ ok: false, error: "invalid_password" }, 200);

    // 2) Delete the file through the Storage API (the supported path).
    const { error } = await admin.storage.from(MEDIA_BUCKET).remove([path]);
    if (error) return json({ ok: false, error: error.message }, 500);

    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
