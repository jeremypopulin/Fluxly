// Supabase Edge Function: delete-technician

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    // --- 1) Validate admin token ---
    const adminToken = req.headers.get("x-admin-token");
    const expectedToken = Deno.env.get("ADMIN_TOKEN");
    if (!adminToken || adminToken !== expectedToken) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- 2) Read request body ---
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- 3) Supabase service role client ---
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- 4) Delete from auth.users ---
    const { error: authError } = await supabase.auth.admin.deleteUser(user_id);
    if (authError) {
      console.error("Error deleting from auth.users:", authError);
      return new Response(
        JSON.stringify({ error: "Failed to delete auth user" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- 5) Delete from profiles ---
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user_id);

    if (profileError) {
      console.error("Error deleting from profiles:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to delete profile" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- 6) Success ---
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
