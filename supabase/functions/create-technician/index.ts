// supabase/functions/create-technicians/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

function withCors(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json",
    },
  });
}

// ---- Hard-coded config for quick testing ----
const PROJECT_URL = "https://diyuewnatraebokzeatl.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeXVld25hdHJhZWJva3plYXRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY2MTM2MiwiZXhwIjoyMDY5MjM3MzYyfQ.yhi7-48zBqQCbBoVAJnxmqT7d2SulPy5xTNxgfrkSHc";
const TECH_CREATION_SECRET = "JosieBeePopulin2023!";

serve(async (req) => {
  if (req.method === "OPTIONS") return withCors("ok");

  try {
    const { email, password, full_name, role, secret } = await req.json();

    if (!email || !password || !full_name || !role || !secret) {
      console.log("❌ Missing fields");
      return withCors(JSON.stringify({ error: "Missing required fields" }), 400);
    }

<<<<<<< HEAD
    if (secret !== TECH_CREATION_SECRET) {
      console.log("❌ Invalid secret");
      return withCorsHeaders(JSON.stringify({ error: "Unauthorized" }), 403);
=======
    // 🔒 Secret check
    const expectedSecret = Deno.env.get("TECH_CREATION_SECRET");
    if (!expectedSecret || secret !== expectedSecret) {
      console.log("❌ Invalid or missing TECH_CREATION_SECRET");
      return withCors(JSON.stringify({ error: "Unauthorized" }), 403);
    }

    const projectUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!projectUrl || !serviceKey) {
      console.log("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return withCors(
        JSON.stringify({ error: "Server misconfigured", detail: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
        500
      );
>>>>>>> 8123b47 (Trigger redeploy with updated Vercel env vars)
    }

    let userId: string | null = null;

<<<<<<< HEAD
    console.log("📨 Creating user...");
    const createRes = await fetch(`${PROJECT_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
=======
    console.log("🔎 Checking for existing user…");
    const searchRes = await fetch(`${projectUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
>>>>>>> 8123b47 (Trigger redeploy with updated Vercel env vars)
      },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const existing = Array.isArray(searchData?.users) ? searchData.users[0] : undefined;
      if (existing?.id) {
        console.log("ℹ️ User already exists:", existing.email);
        userId = existing.id;
      }
    } else {
      console.log("⚠️ Admin search failed:", await searchRes.text());
    }

<<<<<<< HEAD
    console.log("📝 Inserting into profiles...");
    const profileRes = await fetch(`${PROJECT_URL}/rest/v1/profiles`, {
=======
    if (!userId) {
      console.log("📨 Creating user…");
      const createRes = await fetch(`${projectUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const createData = await createRes.json().catch(() => ({}));

      if (createRes.status === 409) {
        console.log("ℹ️ Duplicate user, fetching again…");
        const again = await fetch(`${projectUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        });
        const againData = await again.json().catch(() => ({}));
        const existing = Array.isArray(againData?.users) ? againData.users[0] : undefined;
        if (existing?.id) userId = existing.id;
      } else if (createRes.ok && createData?.user?.id) {
        console.log("✅ User created:", createData.user.email);
        userId = createData.user.id;
      } else if (createData?.id) {
        userId = createData.id;
      } else {
        console.log("❌ Auth creation failed:", createData);
        return withCors(JSON.stringify({ error: "Auth failed", detail: createData }), 400);
      }
    }

    if (!userId) {
      console.log("❌ No userId resolved");
      return withCors(JSON.stringify({ error: "Auth failed: no user id" }), 400);
    }

    const initials = full_name
      .split(" ")
      .filter(Boolean)
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);

    console.log("📝 Upserting into profiles…");
    const profileRes = await fetch(`${projectUrl}/rest/v1/profiles`, {
>>>>>>> 8123b47 (Trigger redeploy with updated Vercel env vars)
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
<<<<<<< HEAD
      body: JSON.stringify([{
        id: userId,
        email,
        name: full_name,
        role,
        initials: full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 3),
      }]),
=======
      body: JSON.stringify([
        {
          id: userId,
          email,
          name: full_name,
          role,
          initials,
        },
      ]),
>>>>>>> 8123b47 (Trigger redeploy with updated Vercel env vars)
    });

    if (!profileRes.ok) {
      console.log("⚠️ Insert failed, trying update…", await profileRes.text());
      const updateRes = await fetch(`${projectUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: "PATCH",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          email,
          name: full_name,
          role,
          initials,
        }),
      });

      if (!updateRes.ok) {
        console.log("❌ Profile update failed:", await updateRes.text());
        return withCors(JSON.stringify({ error: "Failed to upsert profile" }), 500);
      }
    }

    console.log("✅ Technician ready:", email);
    return withCors(JSON.stringify({ success: true, userId }), 200);
  } catch (err) {
    console.error("💥 Unexpected error:", err);
    return withCors(JSON.stringify({ error: "Unexpected error", detail: String(err) }), 500);
  }
});
