import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--surface-dark))] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="text-center border-green-500/30 bg-green-500/5">
          <CardContent className="py-12 px-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-white mb-4">
                Payment Successful!
              </h1>
              <p className="text-gray-300 mb-2">
                Welcome to your new plan!
              </p>
              <p className="text-sm text-gray-400 mb-8">
                You will receive an email confirmation shortly with your invoice.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <Link to={createPageUrl('Dashboard')} className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700">
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