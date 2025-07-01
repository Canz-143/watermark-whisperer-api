
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

    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    '127.0.0.1'

    console.log('Checking guest usage for IP:', clientIP)

    // Check current usage for this IP
    const { data: guestUsage, error } = await supabaseClient
      .from('guest_usage')
      .select('*')
      .eq('ip_address', clientIP)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking guest usage:', error)
      throw error
    }

    const today = new Date().toISOString().split('T')[0]
    const maxFreeUses = 5

    if (!guestUsage) {
      // First time visitor - create new record
      const { data: newUsage, error: insertError } = await supabaseClient
        .from('guest_usage')
        .insert({
          ip_address: clientIP,
          usage_count: 0,
          last_reset_date: today
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating guest usage record:', insertError)
        throw insertError
      }

      return new Response(
        JSON.stringify({
          remaining_uses: maxFreeUses,
          total_free_uses: maxFreeUses,
          can_use: true,
          is_new_user: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Check if we need to reset daily counter
    let currentUsage = guestUsage.usage_count
    if (guestUsage.last_reset_date !== today) {
      // Reset daily counter
      const { error: updateError } = await supabaseClient
        .from('guest_usage')
        .update({
          usage_count: 0,
          last_reset_date: today
        })
        .eq('ip_address', clientIP)

      if (updateError) {
        console.error('Error resetting daily counter:', updateError)
        throw updateError
      }
      currentUsage = 0
    }

    const remainingUses = Math.max(0, maxFreeUses - currentUsage)
    const canUse = remainingUses > 0

    return new Response(
      JSON.stringify({
        remaining_uses: remainingUses,
        total_free_uses: maxFreeUses,
        used_today: currentUsage,
        can_use: canUse,
        is_new_user: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in check-guest-usage:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
