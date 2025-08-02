// supabase/functions/create-technician/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const { email, password, full_name, role, secret } = await req.json()

  // Check required fields
  if (!email || !password || !role || !secret) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
  }

  // Secret check
  const validSecret = Deno.env.get('TECH_CREATION_SECRET')
  if (secret !== validSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid secret' }), { status: 403 })
  }

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const projectUrl = Deno.env.get('SUPABASE_URL')!

  // Step 1: Create user
  const authRes = await fetch(`${projectUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const authData = await authRes.json()

  if (!authRes.ok || !authData.user?.id) {
    return new Response(JSON.stringify({ error: 'Failed to create user', detail: authData }), { status: 400 })
  }

  const userId = authData.user.id

  // Step 2: Add to profiles table
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
        full_name,
        role,
      },
    ]),
  })

  if (!profileRes.ok) {
    return new Response(JSON.stringify({ error: 'Failed to insert into profiles' }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
})
