
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get user credits
    const { data: userCredits } = await supabaseClient
      .from('user_credits')
      .select('*')
      .eq('email', user.email!)
      .single()

    if (!userCredits) {
      // Create new user with 0 credits
      const newUser = {
        user_id: user.id,
        email: user.email!,
        credits: 0,
        is_admin: user.email === 'albertcanz66@gmail.com'
      }
      
      await supabaseClient
        .from('user_credits')
        .insert(newUser)
      
      return new Response(
        JSON.stringify({ credits: 0, is_admin: newUser.is_admin }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        credits: userCredits.credits, 
        is_admin: userCredits.is_admin 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
