# Supabase Integration Setup Guide

This project now includes Supabase integration alongside the existing Base44 SDK. Here's how to set it up and use it.

## 1. Environment Variables

Create a `.env` file in your project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with your actual Supabase project credentials.

## 2. Available Components and Hooks

### SupabaseUserProvider
A new authentication provider that works alongside the existing Base44 authentication:

```jsx
import { SupabaseUserProvider } from '@/components/auth/SupabaseUserProvider';

function App() {
  return (
    <SupabaseUserProvider>
      {/* Your app components */}
    </SupabaseUserProvider>
  );
}
```

### useSupabaseUser Hook
Access the combined authentication state:

```jsx
import { useSupabaseUser } from '@/components/auth/SupabaseUserProvider';

function MyComponent() {
  const { 
    user, 
    supabaseUser, 
    isAuthenticated, 
    authMethod, // 'base44' or 'supabase'
    signInWithSupabase,
    signUpWithSupabase,
    signOutFromSupabase
  } = useSupabaseUser();

  // Use the authentication state
}
```

### useSupabaseAuth Hook
Direct Supabase authentication without the wrapper:

```jsx
import { useSupabaseAuth } from '@/hooks/useSupabase';

function LoginComponent() {
  const { user, loading, error, signIn, signUp, signOut } = useSupabaseAuth();

  const handleLogin = async () => {
    const { data, error } = await signIn(email, password);
    if (error) console.error('Login failed:', error);
  };
}
```

### useSupabaseQuery Hook
For database queries:

```jsx
import { useSupabaseQuery } from '@/hooks/useSupabase';

function DataComponent() {
  const { data, loading, error } = useSupabaseQuery('your_table', (query) => 
    query.select('*').eq('user_id', userId)
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* Render your data */}</div>;
}
```

### useSupabaseRealtime Hook
For real-time data subscriptions:

```jsx
import { useSupabaseRealtime } from '@/hooks/useSupabase';

function RealtimeComponent() {
  const { data, loading, error } = useSupabaseRealtime('your_table', (query) =>
    query.select('*').eq('status', 'active')
  );

  // Data updates automatically when changes occur in the database
}
```

## 3. Direct API Access

### SupabaseAuth
Authentication methods:

```jsx
import { SupabaseAuth } from '@/api/entities';

// Sign up
const { data, error } = await SupabaseAuth.signUp(email, password, {
  metadata: { display_name: 'John Doe' }
});

// Sign in
const { data, error } = await SupabaseAuth.signIn(email, password);

// Sign out
const { error } = await SupabaseAuth.signOut();

// Get current user
const { user, error } = await SupabaseAuth.getCurrentUser();

// Reset password
const { data, error } = await SupabaseAuth.resetPassword(email);
```

### SupabaseDB
Database operations:

```jsx
import { SupabaseDB } from '@/api/entities';

// Query data
const { data, error } = await SupabaseDB.from('your_table')
  .select('*')
  .eq('column', 'value');

// Insert data
const { data, error } = await SupabaseDB.from('your_table')
  .insert({ column1: 'value1', column2: 'value2' });

// Update data
const { data, error } = await SupabaseDB.from('your_table')
  .update({ column1: 'new_value' })
  .eq('id', recordId);

// Delete data
const { data, error } = await SupabaseDB.from('your_table')
  .delete()
  .eq('id', recordId);

// Call RPC functions
const { data, error } = await SupabaseDB.rpc('your_function_name', {
  param1: 'value1',
  param2: 'value2'
});
```

## 4. Hybrid Authentication

The system now supports both Base44 and Supabase authentication simultaneously:

- **Base44**: Existing authentication system for your current users
- **Supabase**: New authentication system with additional features

The `SupabaseUserProvider` will automatically detect which authentication method is active and provide the appropriate user data.

## 5. Migration Strategy

1. **Phase 1**: Keep existing Base44 authentication running
2. **Phase 2**: Gradually migrate users to Supabase authentication
3. **Phase 3**: Use Supabase for new features and data storage

## 6. Storage Integration

Access Supabase Storage:

```jsx
import { SupabaseDB } from '@/api/entities';

// Upload file
const storage = await SupabaseDB.storage();
const { data, error } = await storage
  .from('your-bucket')
  .upload('path/to/file.jpg', file);

// Download file
const { data, error } = await storage
  .from('your-bucket')
  .download('path/to/file.jpg');

// Get public URL
const { data } = storage
  .from('your-bucket')
  .getPublicUrl('path/to/file.jpg');
```

## 7. Next Steps

1. Set up your Supabase project and database schema
2. Update your environment variables
3. Test the authentication flows
4. Migrate existing data if needed
5. Implement new features using Supabase

For more information, refer to the [Supabase documentation](https://supabase.com/docs).
