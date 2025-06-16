
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const sig = req.headers.get('stripe-signature')!
    const body = await req.text()
    
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret!)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const { user_id, email, credits } = session.metadata!
      
      // Add credits to user account
      const { data: existingUser } = await supabaseClient
        .from('user_credits')
        .select('*')
        .eq('email', email)
        .single()

      if (existingUser) {
        // Update existing user credits
        await supabaseClient
          .from('user_credits')
          .update({ 
            credits: existingUser.credits + parseInt(credits),
            updated_at: new Date().toISOString()
          })
          .eq('email', email)
      } else {
        // Create new user credit record
        await supabaseClient
          .from('user_credits')
          .insert({
            user_id,
            email,
            credits: parseInt(credits),
            is_admin: email === 'albertcanz66@gmail.com'
          })
      }

      // Log the transaction
      await supabaseClient
        .from('credit_transactions')
        .insert({
          user_id,
          email,
          transaction_type: 'purchase',
          credits_amount: parseInt(credits),
          stripe_payment_intent_id: session.payment_intent as string,
          description: `Purchased ${credits} credits via Stripe`
        })
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
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
