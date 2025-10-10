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
import { supabaseClient } from '@/api/supabaseClient';

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

export default function SettingsFixed() {
  const { user: authUser, signOut, isLoading: authLoading } = useUser();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  // Check authentication using Supabase directly
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadUser();
  }, []);

  const checkAuthAndLoadUser = async () => {
    try {
      // Get current session directly from Supabase
      const { data: { session }, error } = await supabaseClient.supabase.auth.getSession();
      
      if (error || !session?.user) {
        console.log('No valid session found');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      console.log('Valid session found:', session.user.email);
      setIsAuthenticated(true);

      // Create user object from session
      const sessionUser = {
        id: session.user.id,
        email: session.user.email,
        display_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
        full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
        plan_level: 'free',
        profile_picture_url: session.user.user_metadata?.avatar_url || null
      };

      setUser(sessionUser);
      setFormData({
        full_name: sessionUser.display_name,
        email: sessionUser.email
      });

    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
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
      toast.success('Profile picture updated!');
      // Update user state
      setUser(prev => ({ ...prev, profile_picture_url: file_url }));
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
      // Update user metadata in Supabase Auth
      const { error } = await supabaseClient.supabase.auth.updateUser({
        data: {
          full_name: formData.full_name.trim()
        }
      });

      if (error) throw error;

      // Update local state
      setUser(prev => ({
        ...prev,
        display_name: formData.full_name.trim(),
        full_name: formData.full_name.trim()
      }));

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

    try {
      const { error } = await supabaseClient.supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password update failed:', error);
      toast.error('Failed to update password: ' + (error.message || 'Unknown error'));
    }
  };

  const handleLogout = async () => {
    try {
      await supabaseClient.supabase.auth.signOut();
      navigate('/Home');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
      navigate('/Home');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--surface-dark))] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[rgb(var(--accent-primary))] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
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
      </div>
    );
  }

  const currentPlan = user?.plan_level || 'free';
  const planInfo = PLAN_FEATURES[currentPlan];
  const isFreePlan = currentPlan === 'free';

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
                    <AvatarImage src={user?.profile_picture_url} />
                    <AvatarFallback className="2xl">
                      {(user?.display_name || user?.full_name)?.charAt(0) || user?.email?.charAt(0)}
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
                disabled={isSaving || formData.full_name === (user?.display_name || user?.full_name || '')}
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
      </div>
    </div>
  );
}

