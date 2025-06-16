
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { couponCode } = await req.json()
    
    if (!couponCode) {
      return new Response(
        JSON.stringify({ error: 'Coupon code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing coupon redemption for user ${user.email}: ${couponCode}`)

    // Check if coupon exists and is valid
    const { data: coupon, error: couponError } = await supabaseClient
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (couponError || !coupon) {
      console.log('Coupon not found or inactive:', couponError)
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive coupon code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if coupon has expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Coupon has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if coupon has reached max uses
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      return new Response(
        JSON.stringify({ error: 'Coupon has reached maximum redemption limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has already redeemed this coupon
    const { data: existingRedemption, error: redemptionCheckError } = await supabaseClient
      .from('coupon_redemptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('coupon_code', couponCode.toUpperCase())
      .single()

    if (existingRedemption) {
      return new Response(
        JSON.stringify({ error: 'You have already redeemed this coupon' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get current user credits
    const { data: userCredits, error: creditsError } = await supabaseClient
      .from('user_credits')
      .select('*')
      .eq('email', user.email!)
      .single()

    if (creditsError) {
      console.log('Error fetching user credits:', creditsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Start transaction-like operations
    try {
      // 1. Update user credits
      const { error: updateCreditsError } = await supabaseClient
        .from('user_credits')
        .update({ 
          credits: userCredits.credits + coupon.credits_amount,
          updated_at: new Date().toISOString()
        })
        .eq('email', user.email!)

      if (updateCreditsError) {
        throw new Error('Failed to update user credits')
      }

      // 2. Record the redemption
      const { error: redemptionError } = await supabaseClient
        .from('coupon_redemptions')
        .insert({
          user_id: user.id,
          email: user.email!,
          coupon_code: couponCode.toUpperCase(),
          credits_awarded: coupon.credits_amount
        })

      if (redemptionError) {
        throw new Error('Failed to record coupon redemption')
      }

      // 3. Update coupon usage count
      const { error: updateCouponError } = await supabaseClient
        .from('coupons')
        .update({ 
          uses_count: coupon.uses_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('code', couponCode.toUpperCase())

      if (updateCouponError) {
        throw new Error('Failed to update coupon usage count')
      }

      // 4. Record credit transaction
      const { error: transactionError } = await supabaseClient
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          email: user.email!,
          credits_amount: coupon.credits_amount,
          transaction_type: 'coupon_redemption',
          description: `Coupon redemption: ${couponCode.toUpperCase()}`
        })

      if (transactionError) {
        console.log('Warning: Failed to record transaction:', transactionError)
        // Don't fail the entire operation for this
      }

      console.log(`Successfully redeemed coupon ${couponCode} for user ${user.email}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          credits_awarded: coupon.credits_amount,
          new_balance: userCredits.credits + coupon.credits_amount,
          message: `Successfully redeemed coupon ${couponCode.toUpperCase()} for ${coupon.credits_amount} credits!`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('Transaction failed:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to process coupon redemption. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Coupon redemption error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
