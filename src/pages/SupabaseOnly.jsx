import React from 'react';
import { SupabaseAuthForm } from '@/components/auth/SupabaseAuthForm';
import { SupabaseDemo, SupabaseRealtimeDemo } from '@/components/supabase/SupabaseDemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Database, Users, Zap, Shield, CheckCircle } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabase';

const SupabaseStatusCard = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const isConfigured = supabaseUrl && supabaseKey && 
    supabaseUrl !== 'your_supabase_project_url' && 
    supabaseKey !== 'your_supabase_anon_key';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase Configuration Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Supabase URL:</span>
            <Badge variant={supabaseUrl && supabaseUrl !== 'your_supabase_project_url' ? 'default' : 'destructive'}>
              {supabaseUrl && supabaseUrl !== 'your_supabase_project_url' ? 'Configured' : 'Not Set'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Anonymous Key:</span>
            <Badge variant={supabaseKey && supabaseKey !== 'your_supabase_anon_key' ? 'default' : 'destructive'}>
              {supabaseKey && supabaseKey !== 'your_supabase_anon_key' ? 'Configured' : 'Not Set'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Overall Status:</span>
            <Badge variant={isConfigured ? 'default' : 'destructive'}>
              {isConfigured ? 'Ready' : 'Needs Configuration'}
            </Badge>
          </div>
          
          {isConfigured && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  ✅ Supabase is properly configured!
                </p>
              </div>
              <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                Project URL: {supabaseUrl}
              </p>
            </div>
          )}
          
          {!isConfigured && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Please set your Supabase credentials in the environment variables:
              </p>
              <pre className="text-xs mt-2 bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
                VITE_SUPABASE_URL=your_supabase_project_url{'\n'}
                VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AuthenticationDemo = () => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return <div className="text-center p-8">Loading authentication state...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Supabase Authentication Demo</h2>
        <p className="text-gray-600 dark:text-gray-400">
          This page uses ONLY Supabase authentication (no Base44)
        </p>
      </div>
      
      <div className="flex justify-center">
        <SupabaseAuthForm onSuccess={(user) => {
          console.log('Supabase authentication successful:', user);
        }} />
      </div>

      {user && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold text-center">Welcome! You're authenticated with Supabase</h3>
          
          <Tabs defaultValue="database" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="database">Database Demo</TabsTrigger>
              <TabsTrigger value="realtime">Real-time Demo</TabsTrigger>
            </TabsList>

            <TabsContent value="database" className="space-y-4">
              <SupabaseDemo />
            </TabsContent>

            <TabsContent value="realtime" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SupabaseRealtimeDemo tableName="profiles" />
                <SupabaseRealtimeDemo tableName="posts" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default function SupabaseOnlyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Pure Supabase Integration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            This page demonstrates Supabase working independently of Base44
          </p>
        </div>

        <SupabaseStatusCard />
        <AuthenticationDemo />
      </div>
    </div>
  );
}

