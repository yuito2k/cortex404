// supabase/functions/delete-account/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    // Create a client with the USER's JWT to verify identity
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return new Response('Unauthorized', { status: 401 })

    // Use the service_role client to actually delete
    const adminClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error } = await adminClient.auth.admin.deleteUser(user.id)
    if (error) return new Response(error.message, { status: 500 })

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
    })
})
