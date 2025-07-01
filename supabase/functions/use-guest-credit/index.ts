
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

    const { text } = await req.json()

    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    '127.0.0.1'

    console.log('Using guest credit for IP:', clientIP)

    // Check current usage for this IP
    const { data: guestUsage, error } = await supabaseClient
      .from('guest_usage')
      .select('*')
      .eq('ip_address', clientIP)
      .single()

    if (error) {
      console.error('Error fetching guest usage:', error)
      throw new Error('Guest usage record not found')
    }

    const today = new Date().toISOString().split('T')[0]
    const maxFreeUses = 5

    // Check if we need to reset daily counter
    let currentUsage = guestUsage.usage_count
    if (guestUsage.last_reset_date !== today) {
      currentUsage = 0
    }

    // Check if user has remaining uses
    if (currentUsage >= maxFreeUses) {
      return new Response(
        JSON.stringify({ 
          error: 'Free usage limit reached. Please sign up to continue.',
          remaining_uses: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        },
      )
    }

    // Call the watermark removal API
    const response = await fetch('https://watermark-whisperer-api.vercel.app/api/remove-watermarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!data.success) {
      return new Response(
        JSON.stringify({ error: data.error || 'Failed to process text' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Increment usage count
    const newUsageCount = currentUsage + 1
    const { error: updateError } = await supabaseClient
      .from('guest_usage')
      .update({
        usage_count: newUsageCount,
        last_reset_date: today
      })
      .eq('ip_address', clientIP)

    if (updateError) {
      console.error('Error updating guest usage:', updateError)
    }

    const remainingUses = Math.max(0, maxFreeUses - newUsageCount)

    return new Response(
      JSON.stringify({
        ...data,
        remaining_uses: remainingUses,
        used_today: newUsageCount,
        is_guest: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in use-guest-credit:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
