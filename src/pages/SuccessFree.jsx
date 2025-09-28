import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { toast } from 'sonner';

export default function SuccessFreePage() {
  useEffect(() => {
    const updateUserPlan = async () => {
      try {
        await User.updateMyUserData({ plan_level: 'free' });
        toast.success('Welcome to the Free plan!');
      } catch (error) {
        console.error('Failed to update user plan:', error);
        toast.error('Plan update failed, but your account is active');
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
        <Card className="text-center border-blue-500/30 bg-blue-500/5">
          <CardContent className="py-12 px-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-8 h-8 text-blue-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-white mb-4">
                Welcome to Free Plan!
              </h1>
              <p className="text-gray-300 mb-2">
                You're all set with the Free plan.
              </p>
              <p className="text-sm text-gray-400 mb-8">
                Start creating your first project with up to 3 active projects.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <Link to={createPageUrl('Dashboard')} className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              
              <Link to={createPageUrl('Import')} className="block">
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}