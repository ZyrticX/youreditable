import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Download, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { toast } from 'sonner';

export default function SuccessProPage() {
  useEffect(() => {
    const updateUserPlan = async () => {
      try {
        await User.updateMyUserData({ plan_level: 'pro' });
        toast.success('Welcome to the Pro plan!');
      } catch (error) {
        console.error('Failed to update user plan:', error);
        toast.error('Plan update failed, but your payment was successful');
      }
    };

    updateUserPlan();
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(var(--surface-dark))] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="text-center border-purple-500/30 bg-purple-500/5">
          <CardContent className="py-12 px-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-6 bg-purple-500/20 rounded-full flex items-center justify-center"
            >
              <Crown className="w-8 h-8 text-purple-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-white mb-4">
                Welcome to Pro Plan!
              </h1>
              <p className="text-gray-300 mb-2">
                Thank you for choosing Pro!
              </p>
              <p className="text-sm text-gray-400 mb-8">
                You now have unlimited projects and all premium features.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <Link to={createPageUrl('Dashboard')} className="block">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              
              <Link to={createPageUrl('Billing')} className="block">
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  View Billing
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}