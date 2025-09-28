# 🔧 Subscription System Setup Guide

## Current Status: ✅ 90% Complete!

Your subscription system is mostly configured but needs a few final pieces to be fully functional.

## ✅ What's Already Working:

### 1. **Database Schema (Supabase)**
- ✅ User profiles with `plan_level` field
- ✅ Transaction tracking table
- ✅ Row Level Security policies
- ✅ All necessary indexes

### 2. **Plan Structure**
- ✅ **Free Plan**: $0/month - 3 active projects
- ✅ **Basic Plan**: $17/month ($169/year) - 12 active projects
- ✅ **Pro Plan**: $29/month ($289/year) - Unlimited projects

### 3. **Frontend Features**
- ✅ Project limit enforcement
- ✅ Plan upgrade/downgrade UI
- ✅ Pricing pages
- ✅ Settings with plan management

## ❌ What Needs Setup:

### 1. **Payment Integration**
Currently the app expects Paddle.js functions that don't exist:
```javascript
// These functions are referenced but not implemented:
window.guardedBuy()     // For upgrades
window.goManageBilling() // For plan management
```

**Solution Options:**

#### Option A: Supabase + Stripe (Recommended)
```sql
-- Add to your Supabase project
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Option B: Mock Payment (For Testing)
```javascript
// Add to public/index.html for testing
window.guardedBuy = async (priceKey, planId) => {
  console.log('Mock payment:', priceKey, planId);
  alert('Payment system not connected yet');
};

window.goManageBilling = async () => {
  console.log('Mock billing management');
  alert('Billing management not connected yet');
};
```

### 2. **User Plan Level Management**
Add these functions to handle plan updates:

```javascript
// In src/api/entities.js
export const updateUserPlan = async (userId, planLevel) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ plan_level: planLevel })
    .eq('id', userId);
  return { data, error };
};

export const getUserPlan = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('plan_level')
    .eq('id', userId)
    .single();
  return { data, error };
};
```

### 3. **Webhook Handler (For Real Payments)**
You'll need a Supabase Edge Function to handle payment webhooks:

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Handle Stripe webhooks
  // Update user plan_level based on subscription events
})
```

## 🚀 Quick Setup for Testing:

### 1. **Add Mock Payment Functions**
Add this to your `public/index.html`:

```html
<script>
  // Mock payment functions for testing
  window.guardedBuy = async (priceKey, planId) => {
    console.log('Upgrading to:', planId, 'with price:', priceKey);
    
    // Simulate payment success
    if (confirm(`Upgrade to ${planId} plan?`)) {
      // In real app, this would be handled by webhook
      alert(`Successfully upgraded to ${planId}!`);
      window.location.reload();
    }
  };

  window.goManageBilling = async () => {
    alert('Billing management would open here');
  };
</script>
```

### 2. **Test Plan Updates**
You can manually update user plans in Supabase:

```sql
-- Update a user's plan
UPDATE profiles 
SET plan_level = 'pro' 
WHERE email = 'user@example.com';
```

## 💡 Recommendations:

### For Production:
1. **Use Stripe + Supabase** - Most reliable and feature-rich
2. **Set up webhooks** - Essential for handling subscription changes
3. **Add trial periods** - Good for user conversion

### For Testing:
1. **Use mock functions** - Test the UI and flows
2. **Manually update plans** - Test limit enforcement
3. **Add real payment later** - Focus on core features first

## 📋 Next Steps:

1. **Choose payment option** (Stripe recommended)
2. **Add mock functions for immediate testing**
3. **Test plan limit enforcement**
4. **Set up real payments when ready**

Your subscription system foundation is solid! 🎉
