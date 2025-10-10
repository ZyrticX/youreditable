# 💳 Paddle Payment System - Complete Configuration Guide

## 🎯 Current Status
- ✅ Paddle.js loaded and initialized
- ✅ Live tokens configured
- ❌ **Price IDs need to be updated** (currently placeholders)
- ❌ **Webhooks need configuration**

---

## 📍 Where Paddle is Used in Your Code

### 1. `index.html` (Lines 13-147)
**Main Paddle configuration and initialization:**

```javascript
// Current configuration (lines 17-25)
const PADDLE_CONFIG = {
  environment: 'production',
  token: 'live_78bfb05443070c51ce8ee3aa7e8',           // ✅ Your live token
  environmentKey: 'apikey_01k3zv10jzrjp00ahsrpxxwdcr',  // ✅ Your environment key
  isConfigured: true
};

// NEEDS UPDATE (lines 28-33)
const PADDLE_PRICES = {
  basic_monthly: 'pri_YOUR_BASIC_MONTHLY_PRICE_ID',    // ❌ Replace with real ID
  basic_annual: 'pri_YOUR_BASIC_ANNUAL_PRICE_ID',     // ❌ Replace with real ID
  pro_monthly: 'pri_YOUR_PRO_MONTHLY_PRICE_ID',       // ❌ Replace with real ID
  pro_annual: 'pri_YOUR_PRO_ANNUAL_PRICE_ID'          // ❌ Replace with real ID
};
```

### 2. `supabase/functions/paddle-webhook/index.ts`
**Webhook handler for subscription events:**
- Handles `subscription.created`, `subscription.updated`, `subscription.canceled`
- Updates user plan levels in Supabase
- Records transactions

### 3. Frontend Integration
**Payment buttons throughout the app call:**
```javascript
window.guardedBuy(priceKey, planId)
```

---

## 🚀 Step-by-Step Setup

### Step 1: Access Your Paddle Dashboard
1. Go to [paddle.com](https://paddle.com)
2. Sign in to your account
3. Navigate to your dashboard

### Step 2: Create Products & Prices
1. Go to **Catalog** > **Products**
2. Create these products:

#### Product 1: Basic Plan
- **Name**: "Basic Plan"
- **Description**: "Essential video review features"
- **Create 2 prices:**
  - **Monthly**: $X/month (recurring)
  - **Annual**: $X/year (recurring)

#### Product 2: Pro Plan
- **Name**: "Pro Plan" 
- **Description**: "Advanced video review features"
- **Create 2 prices:**
  - **Monthly**: $X/month (recurring)
  - **Annual**: $X/year (recurring)

### Step 3: Get Price IDs
After creating prices, copy the **Price IDs** (they look like `pri_01h1vjfevh5etwq3rb416a23h2`)

### Step 4: Update Your Code
**Edit `index.html` lines 28-33:**

```javascript
const PADDLE_PRICES = {
  basic_monthly: 'pri_01h1vjfevh5etwq3rb416a23h2',    // Your actual Basic Monthly Price ID
  basic_annual: 'pri_01gsz8ntc6z7npqqp6j4ys0w1w',     // Your actual Basic Annual Price ID
  pro_monthly: 'pri_01h2vjfevh5etwq3rb416a23h3',      // Your actual Pro Monthly Price ID
  pro_annual: 'pri_01h3vjfevh5etwq3rb416a23h4'        // Your actual Pro Annual Price ID
};
```

### Step 5: Set Up Webhooks
1. Go to **Developer Tools** > **Notifications**
2. Click **Add Endpoint**
3. Enter webhook URL: `https://gewffjhkvxppwxhqmtqx.supabase.co/functions/v1/paddle-webhook`
4. Select these events:
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.canceled`
   - ✅ `transaction.completed`
5. Save the webhook

### Step 6: Test the Integration
1. Update the price IDs in your code
2. Deploy to Vercel:
   ```bash
   npm run build
   vercel --prod
   ```
3. Test a payment on your live site
4. Check that webhook receives events in Supabase logs

---

## 🔧 Webhook Configuration Details

### Your Webhook URL
```
https://gewffjhkvxppwxhqmtqx.supabase.co/functions/v1/paddle-webhook
```

### Events to Subscribe To
- **`subscription.created`** - New subscription started
- **`subscription.updated`** - Subscription plan changed
- **`subscription.canceled`** - Subscription cancelled
- **`transaction.completed`** - Payment completed

### What the Webhook Does
1. **Receives payment events** from Paddle
2. **Updates user plan** in Supabase `profiles` table
3. **Records transaction** in `transactions` table
4. **Handles plan upgrades/downgrades** automatically

---

## 🧪 Testing Your Setup

### Test Payment Flow
1. Go to your live site
2. Click on a pricing plan
3. Complete checkout with test card (if in sandbox) or real card
4. Verify:
   - ✅ Payment completes successfully
   - ✅ User plan updates in Supabase
   - ✅ Webhook receives event
   - ✅ Transaction recorded

### Check Webhook Logs
```bash
# View webhook logs
supabase functions logs paddle-webhook
```

### Verify Database Updates
Check your Supabase database:
```sql
-- Check user plan updates
SELECT email, plan_level, paddle_customer_id, subscription_id 
FROM profiles 
WHERE paddle_customer_id IS NOT NULL;

-- Check transaction records
SELECT * FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Price ID not found"
**Solution**: Verify price IDs in Paddle Dashboard match those in `index.html`

### Issue 2: Webhook not receiving events
**Solution**: 
1. Check webhook URL is correct
2. Verify Edge Function is deployed
3. Check Supabase logs for errors

### Issue 3: Payments work but user plan doesn't update
**Solution**:
1. Check webhook is configured for correct events
2. Verify user email matches between Paddle and Supabase
3. Check Edge Function logs for errors

### Issue 4: "Paddle not configured" error
**Solution**: Ensure `PADDLE_CONFIG.isConfigured = true` in `index.html`

---

## 📋 Final Checklist

- [ ] Products created in Paddle Dashboard
- [ ] Price IDs copied and updated in `index.html`
- [ ] Webhook endpoint configured in Paddle
- [ ] Code deployed to Vercel
- [ ] Test payment completed successfully
- [ ] Webhook receives events
- [ ] User plan updates in database
- [ ] Transaction recorded in database

**Once all items are checked, your Paddle integration is complete!** 🎉
