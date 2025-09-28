import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse webhook payload
    const payload = await req.json()
    console.log('Paddle webhook received:', payload.event_type)

    // Verify webhook signature (recommended for production)
    // const signature = req.headers.get('paddle-signature')
    // if (!verifyWebhookSignature(payload, signature)) {
    //   throw new Error('Invalid webhook signature')
    // }

    const { event_type, data } = payload

    switch (event_type) {
      case 'subscription.created':
        await handleSubscriptionCreated(supabaseClient, data)
        break
        
      case 'subscription.updated':
        await handleSubscriptionUpdated(supabaseClient, data)
        break
        
      case 'subscription.canceled':
        await handleSubscriptionCanceled(supabaseClient, data)
        break
        
      case 'transaction.completed':
        await handleTransactionCompleted(supabaseClient, data)
        break
        
      default:
        console.log('Unhandled webhook event:', event_type)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function handleSubscriptionCreated(supabase: any, data: any) {
  console.log('Processing subscription.created:', data.id)
  
  // Extract user email from customer data
  const customerEmail = data.customer?.email
  if (!customerEmail) {
    throw new Error('Customer email not found in subscription data')
  }

  // Find user by email
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', customerEmail)
    .single()

  if (userError || !user) {
    throw new Error(`User not found for email: ${customerEmail}`)
  }

  // Determine plan level from subscription
  const planLevel = getPlanFromSubscription(data)

  // Update user's plan level
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      plan_level: planLevel,
      paddle_customer_id: data.customer_id,
      paddle_subscription_id: data.id
    })
    .eq('id', user.id)

  if (updateError) {
    throw new Error(`Failed to update user plan: ${updateError.message}`)
  }

  // Record transaction
  await recordTransaction(supabase, user.id, data, 'subscription_created')
  
  console.log(`✅ User ${user.email} upgraded to ${planLevel}`)
}

async function handleSubscriptionUpdated(supabase: any, data: any) {
  console.log('Processing subscription.updated:', data.id)
  
  // Find user by Paddle subscription ID
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('paddle_subscription_id', data.id)
    .single()

  if (userError || !user) {
    throw new Error(`User not found for subscription: ${data.id}`)
  }

  // Determine new plan level
  const planLevel = getPlanFromSubscription(data)

  // Update user's plan level
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ plan_level: planLevel })
    .eq('id', user.id)

  if (updateError) {
    throw new Error(`Failed to update user plan: ${updateError.message}`)
  }

  console.log(`✅ User ${user.email} plan updated to ${planLevel}`)
}

async function handleSubscriptionCanceled(supabase: any, data: any) {
  console.log('Processing subscription.canceled:', data.id)
  
  // Find user by Paddle subscription ID
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('paddle_subscription_id', data.id)
    .single()

  if (userError || !user) {
    throw new Error(`User not found for subscription: ${data.id}`)
  }

  // Downgrade to free plan
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      plan_level: 'free',
      paddle_subscription_id: null
    })
    .eq('id', user.id)

  if (updateError) {
    throw new Error(`Failed to downgrade user: ${updateError.message}`)
  }

  console.log(`✅ User ${user.email} downgraded to free`)
}

async function handleTransactionCompleted(supabase: any, data: any) {
  console.log('Processing transaction.completed:', data.id)
  
  // Find user by customer email
  const customerEmail = data.customer?.email
  if (!customerEmail) return

  const { data: user } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', customerEmail)
    .single()

  if (user) {
    await recordTransaction(supabase, user.id, data, 'payment_completed')
  }
}

function getPlanFromSubscription(subscriptionData: any): string {
  // Map Paddle price IDs to plan levels
  const priceIdToPlan: { [key: string]: string } = {
    'pri_basic_monthly_id': 'basic',
    'pri_basic_annual_id': 'basic',
    'pri_pro_monthly_id': 'pro', 
    'pri_pro_annual_id': 'pro'
  }

  // Get the first item's price ID
  const priceId = subscriptionData.items?.[0]?.price?.id
  return priceIdToPlan[priceId] || 'free'
}

async function recordTransaction(supabase: any, userId: string, data: any, type: string) {
  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      transaction_type: type,
      amount: data.billing_details?.totals?.grand_total?.amount / 100, // Convert from cents
      currency: data.billing_details?.totals?.currency_code || 'USD',
      status: 'completed',
      external_id: data.id,
      metadata: data
    })

  if (error) {
    console.error('Failed to record transaction:', error)
  }
}
