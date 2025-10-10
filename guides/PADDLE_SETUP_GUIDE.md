# Paddle Payment System Setup Guide

## Overview
This guide explains how to set up Paddle for payment processing in your application.

## Current Status
⚠️ **Paddle is currently configured with placeholder values and will not work for real payments.**

## Required Steps

### 1. Create Paddle Account
1. Go to [Paddle.com](https://paddle.com) and create an account
2. Complete the verification process
3. Set up your business information

### 2. Get API Tokens
1. In Paddle Dashboard, go to **Developer Tools** > **Authentication**
2. Create API tokens for:
   - **Sandbox** (for testing): `test_xxxxxxxxxxxxxxxxx`
   - **Live** (for production): `live_xxxxxxxxxxxxxxxxx`

### 3. Create Products and Prices
1. Go to **Catalog** > **Products** in Paddle Dashboard
2. Create products for your plans:
   - **Basic Plan** (Monthly & Annual)
   - **Pro Plan** (Monthly & Annual)
3. Note down the **Price IDs** for each plan

### 4. Update Configuration

#### Update `index.html`:
```javascript
const PADDLE_CONFIG = {
  environment: window.location.hostname === 'localhost' ? 'sandbox' : 'production',
  token: window.location.hostname === 'localhost' 
    ? 'test_YOUR_SANDBOX_TOKEN_HERE'
    : window.location.hostname === 'www.youreditable.com'
      ? 'live_YOUR_LIVE_TOKEN_HERE'
      : 'test_YOUR_SANDBOX_TOKEN_HERE',
  
  isConfigured: true // ← Change this to true when tokens are real
};

const PADDLE_PRICES = {
  basic_monthly: 'pri_YOUR_BASIC_MONTHLY_PRICE_ID',
  basic_annual: 'pri_YOUR_BASIC_ANNUAL_PRICE_ID', 
  pro_monthly: 'pri_YOUR_PRO_MONTHLY_PRICE_ID',
  pro_annual: 'pri_YOUR_PRO_ANNUAL_PRICE_ID'
};
```

### 5. Set Up Webhooks
1. In Paddle Dashboard, go to **Developer Tools** > **Notifications**
2. Add webhook endpoint: `https://your-project.supabase.co/functions/v1/paddle-webhook`
3. Select events to listen for:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `transaction.completed`

### 6. Configure Supabase Edge Function
The webhook handler is already created at `supabase/functions/paddle-webhook/index.ts`

Deploy it with:
```bash
supabase functions deploy paddle-webhook
```

### 7. Environment Variables
Add to your Supabase project:
- `PADDLE_WEBHOOK_SECRET` - From Paddle webhook settings

### 8. Testing

#### Sandbox Testing:
1. Use test card numbers from Paddle documentation
2. Test different scenarios (success, failure, cancellation)

#### Production Testing:
1. Start with small amounts
2. Test the complete flow
3. Verify webhooks are received

## Current Error Resolution

The `400 Bad Request` error you're seeing is because:
1. **Invalid Paddle tokens** - Using placeholder values
2. **Invalid Price IDs** - Using example IDs that don't exist
3. **Missing webhook configuration**

## Quick Fix for Development

To test the UI without real payments, you can:
1. Keep `isConfigured: false` in `PADDLE_CONFIG`
2. The app will show a setup message instead of trying to process payments
3. This prevents the 400 errors while you set up real Paddle integration

## Security Notes

- **Never commit real API tokens to Git**
- Use environment variables for sensitive data
- Test thoroughly in sandbox before going live
- Monitor webhook delivery in Paddle Dashboard

## Support

- [Paddle Documentation](https://developer.paddle.com/)
- [Paddle Support](https://paddle.com/support/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)