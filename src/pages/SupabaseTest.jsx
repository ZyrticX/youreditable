import React from 'react';
// Using the main UserProvider which now includes Supabase functionality
import { SupabaseAuthForm } from '@/components/auth/SupabaseAuthForm';
import { SupabaseDemo, SupabaseRealtimeDemo } from '@/components/supabase/SupabaseDemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Database, Users, Zap, Shield } from 'lucide-react';

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

const SupabaseFeatures = () => {
  const features = [
    {
      icon: Shield,
      title: 'Authentication',
      description: 'Built-in user authentication with email/password, social logins, and more'
    },
    {
      icon: Database,
      title: 'Database',
      description: 'PostgreSQL database with real-time subscriptions and row-level security'
    },
    {
      icon: Zap,
      title: 'Real-time',
      description: 'Live updates when data changes, perfect for collaborative applications'
    },
    {
      icon: Users,
      title: 'Edge Functions',
      description: 'Serverless functions that run close to your users for better performance'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="w-5 h-5" />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default function SupabaseTest() {
  return (
    <div>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Supabase Integration Test</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test your Supabase connection and explore the available features
            </p>
          </div>

          <SupabaseStatusCard />

          <Tabs defaultValue="auth" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="realtime">Real-time</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="auth" className="space-y-4">
              <div className="flex justify-center">
                <SupabaseAuthForm onSuccess={(user) => {
                  console.log('Authentication successful:', user);
                }} />
              </div>
            </TabsContent>

            <TabsContent value="database" className="space-y-4">
              <SupabaseDemo />
            </TabsContent>

            <TabsContent value="realtime" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SupabaseRealtimeDemo tableName="profiles" />
                <SupabaseRealtimeDemo tableName="posts" />
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <SupabaseFeatures />
              <Card>
                <CardHeader>
                  <CardTitle>Integration Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Development Benefits</h4>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          <li>• Rapid prototyping with instant backend</li>
                          <li>• Built-in authentication and authorization</li>
                          <li>• Real-time subscriptions out of the box</li>
                          <li>• Automatic API generation from schema</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Production Benefits</h4>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          <li>• Global edge network for low latency</li>
                          <li>• Automatic scaling and load balancing</li>
                          <li>• Built-in security and compliance</li>
                          <li>• Comprehensive monitoring and analytics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
