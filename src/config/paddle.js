// Paddle Configuration
export const PADDLE_CONFIG = {
  // Environment detection
  environment: window.location.hostname === 'localhost' ? 'sandbox' : 'production',
  
  // Tokens (replace with your actual tokens)
  tokens: {
    sandbox: 'test_xxxxxxxxxxxxxxxxx', // Replace with your Paddle sandbox token
    production: 'live_xxxxxxxxxxxxxxxxx' // Replace with your Paddle live token
  },
  
  // Price IDs for different plans (replace with your actual Paddle price IDs)
  prices: {
    basic_monthly: 'pri_01h1vjfevh5etwq3rb416a23h2', // Example ID - replace with yours
    basic_annual: 'pri_01gsz8ntc6z7npqqp6j4ys0w1w',  // Example ID - replace with yours
    pro_monthly: 'pri_01h2vjfevh5etwq3rb416a23h3',   // Example ID - replace with yours
    pro_annual: 'pri_01h3vjfevh5etwq3rb416a23h4'     // Example ID - replace with yours
  },

  // Plan mappings
  planPrices: {
    free: null, // Free plan has no price
    basic: {
      monthly: 'basic_monthly',
      annually: 'basic_annual'
    },
    pro: {
      monthly: 'pro_monthly', 
      annually: 'pro_annual'
    }
  }
};

// Helper function to get price key for a plan and billing cycle
export const getPriceKey = (planId, isAnnual = false) => {
  const plan = PADDLE_CONFIG.planPrices[planId];
  if (!plan) return null;
  
  return isAnnual ? plan.annually : plan.monthly;
};

// Helper function to get Paddle price ID
export const getPaddlePriceId = (priceKey) => {
  return PADDLE_CONFIG.prices[priceKey];
};

export default PADDLE_CONFIG;
