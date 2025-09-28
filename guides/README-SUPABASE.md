# Supabase + Vite React Application

A clean, modern React application built with Vite and Supabase for authentication, database, and backend services.

## 🚀 Features

- ✅ **Pure Supabase Integration** - No Base44 dependencies
- ✅ **Modern React** - Built with React 18 and Vite
- ✅ **Authentication** - Complete auth system with Supabase Auth
- ✅ **Real-time Database** - Live updates with Supabase
- ✅ **Beautiful UI** - Shadcn/ui components with Tailwind CSS
- ✅ **TypeScript Ready** - Full type support
- ✅ **Responsive Design** - Mobile-first approach

## 📦 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **UI Components**: Shadcn/ui, Radix UI
- **Routing**: React Router DOM
- **State Management**: React Context
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 🛠️ Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Get your Supabase credentials:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Settings → API
   - Copy your Project URL and anon key

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── api/                    # API layer
│   ├── entities.js        # Supabase entities and auth
│   └── supabaseClient.js  # Supabase client configuration
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── supabase/         # Supabase-specific components
│   └── ui/               # UI components (shadcn/ui)
├── hooks/                # Custom React hooks
│   └── useSupabase.jsx   # Supabase hooks
├── lib/                  # Utility libraries
│   └── supabase.js       # Supabase configuration
├── pages/                # Application pages
│   ├── SimpleIndex.jsx   # Main app routing
│   ├── Auth.jsx          # Authentication page
│   ├── SupabaseOnly.jsx  # Dashboard/main app
│   └── ...               # Other pages
└── utils/                # Utility functions
```

## 🔐 Authentication

The app uses Supabase Auth with the following features:

- **Sign Up/Sign In** - Email and password authentication
- **Session Management** - Automatic token refresh
- **Protected Routes** - Route-level authentication
- **User Context** - Global user state management

### Usage Example:

```jsx
import { useUser } from '@/components/auth/UserProvider';

function MyComponent() {
  const { user, isAuthenticated, signIn, signOut } = useUser();

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {user.email}!</div>;
}
```

## 🗄️ Database

Use Supabase database with the provided hooks:

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

## ⚡ Real-time Features

Enable real-time subscriptions:

```jsx
import { useSupabaseRealtime } from '@/hooks/useSupabase';

function RealtimeComponent() {
  const { data, loading, error } = useSupabaseRealtime('messages');
  
  // Data updates automatically when changes occur in the database
  return <div>{/* Render real-time data */}</div>;
}
```

## 🎨 UI Components

The app uses shadcn/ui components. Add new components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

## 📄 Available Pages

- **`/`** - Home page
- **`/Auth`** - Authentication (login/signup)
- **`/Dashboard`** - Main dashboard with Supabase features
- **`/Features`** - Features page
- **`/Pricing`** - Pricing page
- **`/About`** - About page
- **`/Contact`** - Contact page

## 🚀 Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform:**
   - Vercel, Netlify, or any static hosting
   - Make sure to set environment variables in your deployment platform

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📚 Learn More

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

