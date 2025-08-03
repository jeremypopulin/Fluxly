import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  const status = response.status;

  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
});
