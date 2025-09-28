// Mock payment functions for testing subscription system
window.guardedBuy = async (priceKey, planId) => {
  console.log('Mock payment - Upgrading to:', planId, 'with price:', priceKey);
  
  if (confirm(`Upgrade to ${planId.toUpperCase()} plan?\n\nThis is a test - no real payment will be made.`)) {
    alert(`✅ Successfully upgraded to ${planId.toUpperCase()} plan!\n\nNote: This is a mock payment for testing.`);
    
    // In real app, webhook would handle this
    // For testing, you can manually update the plan in Supabase
    console.log('In production, webhook would update user plan_level to:', planId);
    
    // Reload to see changes (in real app, this would be automatic)
    setTimeout(() => window.location.reload(), 1000);
  }
};

window.goManageBilling = async () => {
  alert('🏦 Billing Management\n\nIn production, this would open:\n- Cancel subscription\n- Update payment method\n- View billing history\n- Download invoices');
  console.log('Billing management portal would open here');
};

console.log('🧪 Mock payment system loaded for testing');
console.log('💡 To test plans: manually update plan_level in Supabase profiles table');
