
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { credits_to_use, api_endpoint, request_data, response_data } = await req.json()

    // Get user credits
    const { data: userCredits } = await supabaseClient
      .from('user_credits')
      .select('*')
      .eq('email', user.email!)
      .single()

    if (!userCredits) {
      throw new Error('User not found')
    }

    // Check if admin (unlimited credits)
    if (userCredits.is_admin) {
      // Log usage but don't deduct credits for admin
      await supabaseClient
        .from('usage_logs')
        .insert({
          user_id: user.id,
          email: user.email!,
          api_endpoint,
          credits_used: 0, // Admin doesn't use credits
          request_data,
          response_data
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          remaining_credits: userCredits.credits,
          is_admin: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has enough credits
    if (userCredits.credits < credits_to_use) {
      throw new Error('Insufficient credits')
    }

    // Deduct credits
    const newCredits = userCredits.credits - credits_to_use
    await supabaseClient
      .from('user_credits')
      .update({ 
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('email', user.email!)

    // Log the transaction
    await supabaseClient
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        email: user.email!,
        transaction_type: 'usage',
        credits_amount: -credits_to_use,
        description: `Used ${credits_to_use} credits for ${api_endpoint}`
      })

    // Log usage
    await supabaseClient
      .from('usage_logs')
      .insert({
        user_id: user.id,
        email: user.email!,
        api_endpoint,
        credits_used: credits_to_use,
        request_data,
        response_data
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        remaining_credits: newCredits,
        is_admin: false 
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
