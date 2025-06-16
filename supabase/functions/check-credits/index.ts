
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

    console.log('Checking credits for user:', user.email)

    // Get user credits - do NOT create new records here
    const { data: userCredits, error } = await supabaseClient
      .from('user_credits')
      .select('*')
      .eq('email', user.email!)
      .single()

    if (error) {
      console.error('Error fetching user credits:', error)
      
      // If user doesn't exist, return 0 credits but don't create a record
      if (error.code === 'PGRST116') {
        console.log('User not found in credits table:', user.email)
        return new Response(
          JSON.stringify({ 
            credits: 0, 
            is_admin: user.email === 'albertcanz66@gmail.com',
            message: 'User not found in credits system'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      throw error
    }

    console.log('Found user credits:', userCredits)

    return new Response(
      JSON.stringify({ 
        credits: userCredits.credits, 
        is_admin: userCredits.is_admin 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Check credits error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
