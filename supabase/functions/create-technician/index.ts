import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

function withCorsHeaders(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*", // Replace * with your domain if needed
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json",
    },
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return withCorsHeaders("ok");
  }

  try {
    const { email, password, full_name, role, secret } = await req.json();

    if (!email || !password || !role || !secret) {
      return withCorsHeaders(JSON.stringify({ error: 'Missing required fields' }), 400);
    }

    const validSecret = Deno.env.get('TECH_CREATION_SECRET');
    if (secret !== validSecret) {
      return withCorsHeaders(JSON.stringify({ error: 'Unauthorized: Invalid secret' }), 403);
    }

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const projectUrl = Deno.env.get('SUPABASE_URL')!;

    // Create user
    const authRes = await fetch(`${projectUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const authData = await authRes.json();

    if (!authRes.ok || !authData.user?.id) {
      return withCorsHeaders(JSON.stringify({ error: 'Failed to create user', detail: authData }), 400);
    }

    const userId = authData.user.id;

    // Insert into profiles table
    const profileRes = await fetch(`${projectUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify([
        {
          id: userId,
          email,
          name: full_name,
          role,
          initials: full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 3),
        },
      ]),
    });

    if (!profileRes.ok) {
      return withCorsHeaders(JSON.stringify({ error: 'Failed to insert into profiles' }), 500);
    }

    return withCorsHeaders(JSON.stringify({ success: true }), 200);
  } catch (err) {
    return withCorsHeaders(JSON.stringify({ error: 'Unexpected error', detail: `${err}` }), 500);
  }
});
