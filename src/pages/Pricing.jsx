
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Zap, Sparkles, Rocket, Crown } from 'lucide-react'; // Added new icons
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import MarketingLayout from '../components/marketing/MarketingLayout';
import GradientCard from '../components/ui/GradientCard'; // New import

// Original pricing plans data
const PRICING_PLANS_RAW = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out Editable',
    projectLimit: 'Up to 3 active projects',
    pricing: {
      monthly: { price: '$0', period: '/month' },
      annually: { price: '$0', period: '/year' }
    },
    features: [
      'Client Review Management',
      'Smart Notifications',
      'Shareable Review Links (no sign-up needed)',
      'Google Drive Integration',
      'Secure & Simple Dashboard',
      'No File Uploads - Paste Drive Link Only'
    ],
    cta: 'Try Now',
    popular: false
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    description: 'For growing video creators',
    projectLimit: 'Up to 12 active projects',
    pricing: {
      monthly: { price: '$17', period: '/month' },
      annually: { price: '$169', period: '/year', savings: '$35', monthlyEquivalent: '$14.08' }
    },
    features: [
      'Client Review Management',
      'Smart Notifications',
      'Shareable Review Links (no sign-up needed)',
      'Google Drive Integration',
      'Secure & Simple Dashboard',
      'No File Uploads - Paste Drive Link Only'
    ],
    cta: 'Try Now',
    popular: true
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professional teams',
    projectLimit: 'Unlimited active projects',
    pricing: {
      monthly: { price: '$29', period: '/month' },
      annually: { price: '$289', period: '/year', savings: '$59', monthlyEquivalent: '$24.08' }
    },
    features: [
      'Client Review Management',
      'Smart Notifications',
      'Shareable Review Links (no sign-up needed)',
      'Google Drive Integration',
      'Secure & Simple Dashboard',
      'No File Uploads - Paste Drive Link Only'
    ],
    cta: 'Try Now',
    popular: false
  }
};

// Transform the raw pricing plans into the structure needed for the new component
const plans = Object.values(PRICING_PLANS_RAW).map(plan => ({
  id: plan.id,
  name: plan.name,
  description: plan.description,
  // Assign Lucide icons based on plan ID
  icon: plan.id === 'free' ? <Zap className="text-blue-400" /> : plan.id === 'basic' ? <Sparkles className="text-yellow-400" /> : <Rocket className="text-purple-400" />,
  priceMonthly: plan.pricing.monthly.price,
  priceAnnually: plan.pricing.annually.price,
  yearlyDiscount: plan.pricing.annually.savings || null, // `savings` might be undefined for 'free'
  features: plan.features,
  recommended: plan.popular, // Map 'popular' to 'recommended' as used in the outline
  buttonText: plan.cta,
  projectLimit: plan.projectLimit // Keep if needed elsewhere
}));

// BillingToggle component remains mostly the same, its usage is moved into PricingPage
const BillingToggle = ({ isAnnual, onToggle }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
      <div className="flex items-center gap-4">
        <span className={`text-lg font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>
          Monthly
        </span>
        <Switch
          checked={isAnnual}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-purple-600"
        />
        <span className={`text-lg font-medium transition-colors ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
          Annually
        </span>
      </div>
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs font-semibold">
        Save 2 Months
      </Badge>
    </div>
  );
};

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  // Helper function to get the current price based on the annual/monthly toggle
  const getCurrentPrice = (plan) => {
    if (isAnnual) {
      return plan.priceAnnually;
    }
    return plan.priceMonthly;
  };

  // Handler for plan selection button click
  const handlePlanSelect = (planId) => {
    // Retain original behavior of directly navigating via window.location.href
    // In a real app, this might navigate to a checkout page: navigate(`/checkout?plan=${planId}`);
    window.location.href = 'https://youreditable.com/Dashboard';
  };

  return (
    <MarketingLayout>
      <div className="min-h-screen py-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-white mt-12 mb-6 text-4xl font-bold md:text-6xl">Simple Pricing</h2>
          <p className="text-2xl mx-auto text-lg max-w-3xl">Choose the plan that fits your project needs</p>
        </motion.div>

        {/* Billing Toggle */}
        <BillingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />

        {/* Pricing Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full" // Ensure card takes full height in grid
            >
              <GradientCard
                width="100%"
                height="auto" // Auto height allows content to dictate height, flexbox for internal elements handles distribution
                glowIntensity={plan.id === 'pro' ? 'intense' : plan.id === 'basic' ? 'normal' : 'subtle'}
                gradientColors={
                  plan.id === 'pro' ? {
                    primary: "rgba(168, 85, 247, 0.8)", // Purple
                    secondary: "rgba(79, 70, 229, 0)", // Blue (transparent)
                    accent: "rgba(244, 114, 182, 0.8)" // Pink
                  } : plan.id === 'basic' ? {
                    primary: "rgba(245, 158, 11, 0.7)", // Orange
                    secondary: "rgba(79, 70, 229, 0)", // Blue (transparent)
                    accent: "rgba(251, 191, 36, 0.7)" // Yellow
                  } : { // Free plan
                    primary: "rgba(59, 130, 246, 0.6)", // Blue
                    secondary: "rgba(79, 70, 229, 0)", // Blue (transparent)
                    accent: "rgba(96, 165, 250, 0.6)" // Light Blue
                  }
                }
                className={`relative h-full ${plan.recommended ? 'ring-2 ring-violet-500/50' : ''}`} // relative for badge positioning, h-full for content stretching
              >
                <div className="p-8 h-full flex flex-col">
                  {plan.recommended && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-1 text-xs font-semibold">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className="text-4xl mb-4">{plan.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-white">{getCurrentPrice(plan)}</span>
                        {plan.id !== 'free' && (
                          <span className="text-gray-400 ml-2">
                            /{isAnnual ? 'year' : 'month'}
                          </span>
                        )}
                      </div>
                      {isAnnual && plan.id !== 'free' && plan.yearlyDiscount && (
                        <div className="mt-2">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Save {plan.yearlyDiscount} per year
                          </Badge>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400">{plan.description}</p>
                  </div>

                  <div className="flex-1"> {/* flex-1 allows this section to grow and push the button to the bottom */}
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full ${
                      plan.recommended
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
                        : 'bg-white/10 hover:bg-white/20 border border-white/20'
                    }`}
                    size="lg"
                  >
                    {plan.buttonText}
                    {plan.recommended && <Crown className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </GradientCard>
            </motion.div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
