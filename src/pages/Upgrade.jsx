import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Crown,
  Star,
  Check,
  Zap,
  Shield,
  BarChart3,
  Users,
  Palette,
  HeadphonesIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/auth/UserProvider';
import { toast } from 'sonner';

const PLAN_FEATURES = {
  free: {
    id: 'free',
    name: 'Free',
    icon: '🚀',
    pricing: {
      monthly: { price: '$0', period: '' },
      annually: { price: '$0', period: '' }
    },
    color: 'border-blue-500/30 bg-blue-500/5',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    description: 'Perfect for trying out Editable',
    mainFeature: 'Up to 3 active projects',
    features: [
      'Client Review Management',
      'Smart Notifications',
      'Shareable Review Links (no sign-up needed)',
      'Google Drive Integration',
      'Secure & Simple Dashboard',
      'No File Uploads - Paste Drive Link Only'
    ],
    limitations: []
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    icon: '⭐',
    pricing: {
      monthly: { price: '$17', period: '/month' },
      annually: { price: '$169', period: '/year', savings: '$35', monthlyEquivalent: '$14.08' }
    },
    color: 'border-amber-500/30 bg-amber-500/5',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
    recommended: true,
    description: 'For growing video creators',
    mainFeature: 'Up to 12 active projects',
    features: [
      'Client Review Management',
      'Smart Notifications',
      'Shareable Review Links (no sign-up needed)',
      'Google Drive Integration',
      'Secure & Simple Dashboard',
      'No File Uploads - Paste Drive Link Only'
    ],
    limitations: []
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    icon: '💎',
    pricing: {
      monthly: { price: '$29', period: '/month' },
      annually: { price: '$289', period: '/year', savings: '$59', monthlyEquivalent: '$24.08' }
    },
    color: 'border-purple-500/30 bg-purple-500/5',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    description: 'For professional teams',
    mainFeature: 'Unlimited active projects',
    features: [
      'Client Review Management',
      'Smart Notifications',
      'Shareable Review Links (no sign-up needed)',
      'Google Drive Integration',
      'Secure & Simple Dashboard',
      'No File Uploads - Paste Drive Link Only'
    ],
    limitations: []
  }
};

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

const PlanCard = ({ plan, currentPlan, isAnnual }) => {
  const isCurrentPlan = currentPlan === plan.id;
  const pricing = plan.pricing[isAnnual ? 'annually' : 'monthly'];
  
  const handleButtonClick = async () => {
    if (isCurrentPlan) return;
    
    // Check if billing functions are available
    if (!window.guardedBuy || !window.goManageBilling) {
      toast.error('Billing system not ready. Please refresh the page.');
      return;
    }

    try {
      // Determine action based on current and target plan
      if (currentPlan === 'free' && plan.id === 'basic') {
        // Free to Basic
        const priceKey = isAnnual ? 'basic_annual' : 'basic_monthly';
        await window.guardedBuy(priceKey, 'basic');
      } else if (currentPlan === 'free' && plan.id === 'pro') {
        // Free to Pro
        const priceKey = isAnnual ? 'pro_annual' : 'pro_monthly';
        await window.guardedBuy(priceKey, 'pro');
      } else if (currentPlan === 'basic' && plan.id === 'pro') {
        // Basic to Pro
        const priceKey = isAnnual ? 'pro_annual' : 'pro_monthly';
        await window.guardedBuy(priceKey, 'pro');
      } else if ((currentPlan === 'basic' && plan.id === 'free') || 
                 (currentPlan === 'pro' && plan.id === 'free') ||
                 (currentPlan === 'pro' && plan.id === 'basic')) {
        // Downgrade scenarios - go to Customer Portal
        await window.goManageBilling();
      }
    } catch (error) {
      console.error('Billing action failed:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const getButtonText = () => {
    if (isCurrentPlan) return 'Current Plan';
    if (currentPlan === 'free' && (plan.id === 'basic' || plan.id === 'pro')) return 'Upgrade';
    if (currentPlan === 'basic' && plan.id === 'pro') return 'Upgrade';
    if (currentPlan === 'basic' && plan.id === 'free') return 'Downgrade';
    if (currentPlan === 'pro' && (plan.id === 'basic' || plan.id === 'free')) return 'Downgrade';
    return 'Change Plan';
  }

  const buttonText = getButtonText();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative"
    >
      <Card className={`${plan.color} border-2 h-full relative overflow-hidden`}>
        {plan.recommended && (
          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            Recommended
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <div className="text-4xl mb-2">{plan.icon}</div>
          <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-white">{pricing.price}</span>
            {pricing.period && (
              <span className="text-gray-400 text-sm">{pricing.period}</span>
            )}
          </div>

          {/* Annual Savings Display */}
          {isAnnual && pricing.savings && (
            <div className="space-y-1">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Save {pricing.savings} per year
              </Badge>
              <p className="text-xs text-green-400">
                Only {pricing.monthlyEquivalent}/month • 2 months free!
              </p>
            </div>
          )}

          <CardDescription className="text-gray-300 mt-2">{plan.description}</CardDescription>

          {isCurrentPlan && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-2">
              <Check className="w-3 h-3 mr-1" />
              Current Plan
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="font-medium text-white text-lg mb-4">{plan.mainFeature}</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Everything included:</h4>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={handleButtonClick}
            disabled={isCurrentPlan}
            className={`w-full ${plan.buttonColor} ${isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {buttonText.includes('Upgrade') && <Crown className="w-4 h-4 mr-2" />}
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const SupportPlaceholderModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeadphonesIcon className="w-5 h-5" />
            Support Coming Soon
          </DialogTitle>
          <DialogDescription>
            Thanks for your interest! Our support flow will be added soon.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-300 mb-4">
            For now, please email us directly at{' '}
            <a
              href="mailto:support@editable.com"
              className="text-violet-400 hover:text-violet-300 underline"
            >
              support@editable.com
            </a>
          </p>
          <p className="text-sm text-gray-400">
            We'll get back to you within 24 hours to help with your plan change request.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function UpgradePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const currentPlan = user?.plan_level || 'free';

  const currentPlanInfo = PLAN_FEATURES[currentPlan];

  return (
    <div className="min-h-screen bg-[rgb(var(--surface-dark))] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Upgrade Plan
              </h1>
              <p className="text-gray-400">Choose the plan that fits your needs</p>
            </div>
          </div>

          {currentPlanInfo && (
            <div className="flex items-center justify-between gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{currentPlanInfo.icon}</div>
                <div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Current: {currentPlanInfo.name}
                  </Badge>
                  <p className="text-sm text-gray-400 mt-1">
                    {currentPlanInfo.mainFeature}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <BillingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.values(PLAN_FEATURES).map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PlanCard
                plan={plan}
                currentPlan={currentPlan}
                isAnnual={isAnnual}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <SupportPlaceholderModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </div>
  );
}