// IMPORTANT: Uses service role to create users, includes CORS and admin role check.
// Requires SUPABASE_SERVICE_ROLE_KEY to be set in project secrets.

import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AppRole = "admin" | "editor" | "viewer";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...corsHeaders } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://mqjtebcyrzmnapditxfj.supabase.co";
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xanRlYmN5cnptbmFwZGl0eGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTUxNDAsImV4cCI6MjA3MDQ5MTE0MH0.awHBmuqwFW0urRUrZqCjcSD6vvZjyX-ERGJ-j73YLSk";
    if (!SERVICE_ROLE) return json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, 500);

    // Client with caller's JWT to check role
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUser = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });

    // Service role client for privileged actions
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: auth } = await supabaseUser.auth.getUser();
    const requesterId = auth.user?.id;
    if (!requesterId) return json({ error: "Not authenticated" }, 401);

    // Check admin role
    const { data: roles, error: roleErr } = await supabaseUser.from("user_roles").select("role").eq("user_id", requesterId);
    if (roleErr) return json({ error: roleErr.message }, 500);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const email: string = body?.email;
    const displayName: string = body?.displayName ?? "";
    const role: AppRole = body?.role ?? "editor";
    if (!email || !role) return json({ error: "email and role are required" }, 400);

    // Generate a temporary password
    const tempPassword = crypto.randomUUID().replace(/-/g, "").slice(0, 12) + "!aA";

    // Create user
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });
    if (createErr || !created.user) return json({ error: createErr?.message ?? "Create user failed" }, 500);

    const newUserId = created.user.id;

    // Upsert profile and role
    const { error: profErr } = await supabaseAdmin.from("profiles").upsert({ id: newUserId, display_name: displayName, must_change_password: true });
    if (profErr) return json({ error: profErr.message }, 500);

    const { error: roleInsErr } = await supabaseAdmin.from("user_roles").insert({ user_id: newUserId, role });
    if (roleInsErr && !roleInsErr.message.includes("duplicate")) return json({ error: roleInsErr.message }, 500);

    return json({ email, tempPassword });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
