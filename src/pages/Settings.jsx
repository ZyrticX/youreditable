
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadFile } from '@/api/integrations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Loader2, Camera, LogOut, Save, Shield, Trash2, AlertTriangle, Crown, Check, X, CreditCard, ExternalLink, MessageCircle, Info, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useUser } from '../components/auth/UserProvider';


const PLAN_FEATURES = {
  free: {
    name: 'Free Plan',
    price: 'Free',
    icon: '🚀',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/30',
    included: [
      '3 active projects',
      'Basic video review tools',
      'Client feedback collection',
      '7-day review links',
      'Email notifications'
    ],
    limitations: [
      'Limited to 3 projects',
      'No advanced analytics',
      'Standard support only'
    ]
  },
  basic: {
    name: 'Basic Plan',
    price: '$17/month',
    icon: '⭐',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/20',
    borderColor: 'border-amber-500/30',
    included: [
      '12 active projects',
      'All video review tools',
      'Client feedback collection',
      'Extended review links',
      'Email notifications',
      'Project analytics',
      'Priority support'
    ],
    limitations: [
      'Limited to 12 projects',
      'Basic integrations only'
    ]
  },
  pro: {
    name: 'Pro Plan',
    price: '$29/month',
    icon: '💎',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-500/30',
    included: [
      'Unlimited projects',
      'All video review tools',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'Premium integrations',
      '24/7 priority support',
      'Team collaboration'
    ],
    limitations: []
  }
};

export default function SettingsPage() {
  const { user: authUser, signOut, isLoading: authLoading, isAuthenticated } = useUser();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', // Renamed to display_name in logic, but keeping 'full_name' for input binding consistency
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      loadUserData();
    }
  }, [authLoading, authUser]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Try to get user profile from database
      try {
        const profiles = await User.filter({ id: authUser.id });
        const currentUser = profiles.length > 0 ? profiles[0] : null;
        
        if (currentUser) {
          setUser(currentUser);
          setFormData({
            full_name: currentUser.display_name || currentUser.full_name || authUser.user_metadata?.full_name || '',
            email: currentUser.email || authUser.email || ''
          });

          if (!currentUser.display_user_id || currentUser.display_user_id !== currentUser.id) {
            await User.updateMyUserData({ display_user_id: currentUser.id });
          }
        } else {
          // Create basic user object from auth data
          const basicUser = {
            id: authUser.id,
            email: authUser.email,
            display_name: authUser.user_metadata?.full_name || '',
            full_name: authUser.user_metadata?.full_name || '',
            plan_level: 'free'
          };
          setUser(basicUser);
          setFormData({
            full_name: basicUser.display_name || basicUser.full_name || '',
            email: basicUser.email || ''
          });
        }
      } catch (dbError) {
        console.log('Could not load user profile from database, using auth data:', dbError);
        // Fallback to auth user data
        const basicUser = {
          id: authUser.id,
          email: authUser.email,
          display_name: authUser.user_metadata?.full_name || '',
          full_name: authUser.user_metadata?.full_name || '',
          plan_level: 'free'
        };
        setUser(basicUser);
        setFormData({
          full_name: basicUser.display_name || basicUser.full_name || '',
          email: basicUser.email || ''
        });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      await User.updateMyUserData({ profile_picture_url: file_url });
      await loadUserData();
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.full_name.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Saving profile with data:', { display_name: formData.full_name });

      const updateData = {
        display_name: formData.full_name.trim(),
        display_user_id: displayUser.id
      };

      await User.updateMyUserData(updateData);

      // Reload user data to reflect changes
      await loadUserData();

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // Note: This would typically integrate with your auth provider
    toast.info('Password change functionality would be implemented with your auth provider');
    setShowPasswordForm(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeactivateAccount = async () => {
    toast.info('Account deactivation would be implemented based on your business requirements');
  };

  const handleDeleteAccount = async () => {
    toast.error('Account deletion is permanent and would be implemented with proper safeguards');
    setShowDeleteConfirm(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect to home page
      window.location.href = '/Home';
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
      // Even if logout fails, redirect to home
      window.location.href = '/Home';
    }
  };

  // Move this after displayUser definition
  // Will be updated below

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--surface-dark))] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[rgb(var(--accent-primary))] animate-spin" />
      </div>);
  }

  // Debug authentication state
  console.log('Settings page auth state:', { 
    isAuthenticated, 
    hasAuthUser: !!authUser, 
    authUserEmail: authUser?.email,
    authLoading 
  });

  if (!isAuthenticated || !authUser) {
    console.log('Settings: User not authenticated, showing login prompt');
    return (
      <div className="min-h-screen bg-[rgb(var(--surface-dark))] flex items-center justify-center">
        <Card className="max-w-md w-full bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))]">
          <CardContent className="text-center py-8">
            <p className="text-white mb-4">Please log in to access settings</p>
            <Button onClick={() => navigate('/Login')} className="bg-[rgb(var(--accent-primary))] hover:bg-violet-600">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>);
  }

  // If we have authUser but no user profile, show basic interface
  const displayUser = user || {
    id: authUser.id,
    email: authUser.email,
    display_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
    full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
    plan_level: 'free'
  };

  const currentPlan = displayUser?.plan_level || 'free';
  const planInfo = PLAN_FEATURES[currentPlan];
  const isFreePlan = currentPlan === 'free';
  const isProPlan = currentPlan === 'pro';

  return (
    <div className="min-h-screen bg-[rgb(var(--surface-dark))] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Account Settings</h1>
          <p className="text-[rgb(var(--text-secondary))]">Manage your profile and account preferences</p>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <Card className="bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))]">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription>Update your personal details and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={displayUser?.profile_picture_url} />
                    <AvatarFallback className="2xl">
                      {(displayUser?.display_name || displayUser?.full_name)?.charAt(0) || displayUser?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-picture-upload"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[rgb(var(--accent-primary))] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-violet-600 transition-colors">
                    {isUploading ?
                      <Loader2 className="w-4 h-4 animate-spin" /> :
                      <Camera className="w-4 h-4" />
                    }
                  </label>
                  <input
                    id="profile-picture-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    disabled={isUploading} />
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Display Name</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Your display name"
                    className="bg-[rgb(var(--surface-dark))] border-[rgb(var(--border-dark))] text-white" />
                  <p className="text-xs text-[rgb(var(--text-secondary))]">This is how your name will appear in the app</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Email</label>
                  <Input
                    value={formData.email}
                    readOnly
                    className="bg-[rgb(var(--surface-dark))] border-[rgb(var(--border-dark))] text-gray-400" />
                  <p className="text-xs text-[rgb(var(--text-secondary))]">Email cannot be changed</p>
                </div>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={isSaving || formData.full_name === (displayUser?.display_name || displayUser?.full_name || '')}
                className="bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white accent-glow">
                {isSaving ?
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </> :
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                }
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Billing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <Card className="bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing
              </CardTitle>
              <CardDescription>Manage your subscription and payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Summary Card */}
              <div className={`p-6 rounded-xl border-2 ${planInfo.borderColor} ${planInfo.bgColor} relative`}>
                {/* Mobile: Button below title, Desktop: Button in top-right */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">{planInfo.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">
                        You're on the {planInfo.name}
                      </h3>
                      {displayUser.next_billing_date && !isFreePlan &&
                        <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                          Your plan renews on {format(new Date(displayUser.next_billing_date), 'MMMM dd, yyyy')}
                        </p>
                      }
                      {isFreePlan &&
                        <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                          Up to 3 active projects. No credit card required.
                        </p>
                      }
                    </div>
                  </div>

                  {/* Manage Dropdown Button */}
                  <div className="flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          Manage
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem
                          onClick={() => window.goManageBilling()}
                          className="cursor-pointer">
                          <Crown className="w-4 h-4 mr-2" />
                          Manage Plan
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => window.goManageBilling()}
                          className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-200/20">
                          <X className="w-4 h-4 mr-2" />
                          Cancel Subscription
                        </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <h4 className="font-medium text-white">What's included:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {planInfo.included.map((feature, index) =>
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-[rgb(var(--text-secondary))]">{feature}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Payment</h4>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                      {isFreePlan ? 'No payment method required' : 'Manage your subscription and billing details'}
                    </p>
                  </div>
                  <Button
                    onClick={() => window.goManageBilling()}
                    variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </div>

                {/* Need Help with Billing */}
                <div className="pt-4 border-t border-[rgb(var(--border-dark))]">
                  <Button
                    onClick={() => window.goManageBilling()}
                    variant="ghost" className="text-[#bc80fa] p-0 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-white h-auto">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Need help with billing?
                  </Button>
                </div>

                {/* FAQ Section */}
                <div className="pt-4 border-t border-[rgb(var(--border-dark))]">
                  <div className="flex items-center gap-2 p-3 bg-blue-900/20 text-blue-300 rounded-lg">
                    <Info className="w-4 h-4" />
                    <p className="text-sm">FAQ section coming soon</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <Card className="bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
              <CardDescription>Manage your password and account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex-1">
                  <Shield className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>

              {showPasswordForm &&
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-4 border-t border-[rgb(var(--border-dark))]">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-white">Current Password</label>
                      <Input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        className="bg-[rgb(var(--surface-dark))] border-[rgb(var(--border-dark))] text-white" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white">New Password</label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                        className="bg-[rgb(var(--surface-dark))] border-[rgb(var(--border-dark))] text-white" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white">Confirm New Password</label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="bg-[rgb(var(--surface-dark))] border-[rgb(var(--border-dark))] text-white" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowPasswordForm(false)}
                      variant="outline"
                      size="sm">
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePasswordChange}
                      size="sm"
                      className="bg-[rgb(var(--accent-primary))] hover:bg-violet-600">
                      Update Password
                    </Button>
                  </div>
                </motion.div>
              }
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}>
          <Card className="bg-[rgb(var(--surface-light))] border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleDeactivateAccount}
                  className="flex-1 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                  Deactivate Account
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>

              {showDeleteConfirm &&
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm mb-4">
                    This action cannot be undone. This will permanently delete your account and all associated data.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="outline"
                      size="sm">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white">
                      Yes, Delete Account
                    </Button>
                  </div>
                </motion.div>
              }
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>);
}
