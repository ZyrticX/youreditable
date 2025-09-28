# 🚀 Paddle Payment Integration Setup Guide

## ✅ What's Already Implemented

Your app now has a complete Paddle payment integration! Here's what's been added:

### 1. **Frontend Integration** (`index.html`)
- ✅ Paddle.js CDN loaded
- ✅ Automatic environment detection (sandbox/production)
- ✅ Payment functions (`guardedBuy`, `goManageBilling`)
- ✅ Event listeners for payment completion
- ✅ User context integration

### 2. **Configuration** (`src/config/paddle.js`)
- ✅ Environment-based configuration
- ✅ Price ID mappings for all plans
- ✅ Helper functions for price resolution

### 3. **Database Schema** (`paddle-schema-update.sql`)
- ✅ Paddle customer/subscription ID fields
- ✅ Detailed subscriptions table
- ✅ Proper indexes and RLS policies

### 4. **Webhook Handler** (`supabase/functions/paddle-webhook/index.ts`)
- ✅ Handles subscription created/updated/canceled
- ✅ Automatic plan level updates
- ✅ Transaction recording
- ✅ User plan synchronization

## 🔧 Setup Steps

### Step 1: Create Paddle Account
1. **Sign up**: Go to [Paddle.com](https://paddle.com) and create an account
2. **Verify**: Complete identity verification (required for live payments)
3. **Sandbox**: Start with sandbox environment for testing

### Step 2: Create Products & Prices in Paddle Dashboard
Navigate to **Catalog → Products** and create:

#### Basic Plan
- **Product Name**: "Basic Plan - Video Review App"
- **Monthly Price**: $17/month (recurring)
- **Annual Price**: $169/year (recurring, save $35)

#### Pro Plan  
- **Product Name**: "Pro Plan - Video Review App"
- **Monthly Price**: $29/month (recurring)
- **Annual Price**: $289/year (recurring, save $59)

**📝 Note**: Copy the Price IDs (starting with `pri_`) for the next step.

### Step 3: Update Configuration

#### A. Update Paddle Tokens (`index.html`)
```javascript
// Replace these tokens with your actual Paddle tokens
token: window.location.hostname === 'localhost' 
  ? 'test_your_sandbox_token_here'     // Your sandbox token
  : 'live_your_production_token_here', // Your live token
```

#### B. Update Price IDs (`index.html`)
```javascript
const PADDLE_PRICES = {
  basic_monthly: 'pri_your_basic_monthly_id',
  basic_annual: 'pri_your_basic_annual_id', 
  pro_monthly: 'pri_your_pro_monthly_id',
  pro_annual: 'pri_your_pro_annual_id'
};
```

### Step 4: Setup Supabase Database
1. **Run Schema Update**:
   ```sql
   -- In your Supabase SQL Editor, run:
   -- Copy and paste contents of paddle-schema-update.sql
   ```

2. **Deploy Webhook Function**:
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Deploy the webhook function
   supabase functions deploy paddle-webhook
   ```

### Step 5: Configure Paddle Webhooks
1. **Go to**: Paddle Dashboard → Developer Tools → Notifications
2. **Add Endpoint**: `https://your-project.supabase.co/functions/v1/paddle-webhook`
3. **Subscribe to Events**:
   - `subscription.created`
   - `subscription.updated` 
   - `subscription.canceled`
   - `transaction.completed`

### Step 6: Update Price IDs in Webhook
Edit `supabase/functions/paddle-webhook/index.ts`:
```typescript
const priceIdToPlan: { [key: string]: string } = {
  'pri_your_basic_monthly_id': 'basic',
  'pri_your_basic_annual_id': 'basic',
  'pri_your_pro_monthly_id': 'pro', 
  'pri_your_pro_annual_id': 'pro'
}
```

## 🧪 Testing Your Integration

### 1. **Test in Sandbox Mode**
- Use sandbox tokens and price IDs
- Test payments with Paddle's test cards
- Verify webhook events in Supabase logs

### 2. **Test Payment Flow**
1. Go to `/Pricing` or `/Upgrade`
2. Click upgrade on any plan
3. Paddle checkout should open
4. Complete test payment
5. Check Supabase to see plan updated

### 3. **Test Webhooks**
- Monitor Supabase Function logs
- Check `profiles` table for plan updates
- Verify `transactions` table entries

## 🔄 How It Works

### Payment Flow
1. **User clicks upgrade** → `guardedBuy()` function called
2. **Paddle checkout opens** → User completes payment
3. **Payment succeeds** → Paddle sends webhook to Supabase
4. **Webhook processes** → Updates user's plan in database
5. **User sees changes** → Plan limits and UI update

### Plan Enforcement
- **Project limits** enforced in Dashboard/Projects/Import pages
- **Real-time updates** when plan changes
- **Automatic downgrades** when subscription canceled

## 🚀 Going Live

### 1. **Switch to Production**
- Update tokens to live environment
- Update price IDs to production prices
- Test with small amounts first

### 2. **Security Checklist**
- ✅ Enable webhook signature verification
- ✅ Use HTTPS for all endpoints
- ✅ Validate all webhook data
- ✅ Monitor for failed payments

### 3. **Monitoring**
- Monitor Supabase function logs
- Set up alerts for failed webhooks
- Track subscription metrics in Paddle dashboard

## 🎯 Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| Frontend Integration | ✅ Complete | Ready for testing |
| Database Schema | ✅ Complete | Run SQL update |
| Webhook Handler | ✅ Complete | Deploy to Supabase |
| Paddle Configuration | ⏳ Needs Setup | Add your tokens/prices |
| Testing | ⏳ Ready | Update config first |
| Production | ⏳ Ready | After testing |

## 🆘 Troubleshooting

### Common Issues
1. **"Price ID not found"** → Update PADDLE_PRICES with your actual price IDs
2. **"Paddle not initialized"** → Check your tokens are correct
3. **"Webhook not firing"** → Verify webhook URL in Paddle dashboard
4. **"User plan not updating"** → Check Supabase function logs

### Support
- **Paddle Docs**: [developer.paddle.com](https://developer.paddle.com)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

Your Paddle integration is ready! 🎉 Just add your tokens and price IDs to start accepting payments.
