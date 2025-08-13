// supabase/functions/delete-technician/index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// ✅ Allow browser requests from anywhere (adjust for production)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight (OPTIONS request)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, email, secret } = await req.json();

    // ✅ Simple shared secret guard (matches your existing setup)
    if (secret !== "JosieBeePopulin2023!") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve userId from email if not provided
    let resolvedUserId = userId as string | null;

    if (!resolvedUserId && email) {
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (profileErr) {
        console.warn("Profile lookup error:", profileErr);
      }

      if (profile?.id) {
        resolvedUserId = profile.id as string;
      }
    }

    // 1️⃣ Delete from auth.users
    if (resolvedUserId) {
      const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(
        resolvedUserId
      );
      if (authErr) {
        console.warn("Auth delete warning:", authErr);
      }
    }

    // 2️⃣ Delete from profiles table
    {
      let q = supabaseAdmin.from("profiles").delete();
      if (resolvedUserId) q = q.eq("id", resolvedUserId);
      else if (email) q = q.eq("email", email);

      const { error: profileDelErr } = await q;
      if (profileDelErr) {
        console.warn("Profiles delete warning:", profileDelErr);
      }
    }

    // 3️⃣ Delete from technicians table (if exists)
    {
      let q = supabaseAdmin.from("technicians").delete();
      if (resolvedUserId) q = q.eq("id", resolvedUserId);
      else if (email) q = q.eq("email", email);

      const { error: techDelErr } = await q;
      if (techDelErr) {
        console.warn("Technicians delete warning:", techDelErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("delete-technician error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
