import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

function withCorsHeaders(body: string, status = 200) {
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

serve(async (req) => {
  if (req.method === "OPTIONS") return withCorsHeaders("ok");

  try {
    const { email, password, full_name, role, secret } = await req.json();

    if (!email || !password || !full_name || !role || !secret) {
      console.log("❌ Missing fields");
      return withCorsHeaders(JSON.stringify({ error: "Missing required fields" }), 400);
    }

    const expectedSecret = Deno.env.get("TECH_CREATION_SECRET");
    if (secret !== expectedSecret) {
      console.log("❌ Invalid secret");
      return withCorsHeaders(JSON.stringify({ error: "Unauthorized" }), 403);
    }

    const projectUrl = Deno.env.get("PROJECT_URL")!;
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    let userId: string | null = null;

    console.log("📨 Creating user...");
    const createRes = await fetch(`${projectUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const createData = await createRes.json();

    if (createRes.ok && createData.user?.id) {
      console.log("✅ User created:", createData.user.email);
      userId = createData.user.id;
    } else if (createData.id) {
      console.log("⚠️ User already exists:", createData.email);
      userId = createData.id;
    } else {
      console.log("❌ Auth creation failed:", createData);
      return withCorsHeaders(JSON.stringify({ error: "Auth failed", detail: createData }), 400);
    }

    console.log("📝 Inserting into profiles...");
    const profileRes = await fetch(`${projectUrl}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify([{
        id: userId,
        email,
        name: full_name,
        role,
        initials: full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 3),
      }]),
    });

    if (!profileRes.ok) {
      const errorText = await profileRes.text();
      console.log("❌ Profile insert failed:", errorText);
      return withCorsHeaders(JSON.stringify({ error: "Failed to insert profile", detail: errorText }), 500);
    }

    console.log("✅ Technician created:", email);
    return withCorsHeaders(JSON.stringify({ success: true }), 200);

  } catch (err) {
    console.error("💥 Unexpected error:", err);
    return withCorsHeaders(JSON.stringify({ error: "Unexpected error", detail: `${err}` }), 500);
  }
});
