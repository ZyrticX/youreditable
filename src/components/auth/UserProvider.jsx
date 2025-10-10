import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupabaseAuth } from '@/api/entities';
import { Loader2 } from 'lucide-react';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);

    useEffect(() => {
        // Prevent multiple initializations
        if (authInitialized) return;
        
        const currentPath = window.location.pathname;
        const isPublicPage = ['/', '/Home', '/Features', '/Pricing', '/About', '/Contact', '/Terms', '/Privacy', '/SupabaseOnly', '/Faq', '/Refund'].includes(currentPath);
        
        const initializeUser = async () => {
            setIsLoading(true);
            try {
                const { session } = await SupabaseAuth.getCurrentSession();
                
                if (session?.user) {
                    setUser(session.user);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.log("Authentication check failed:", error.message);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
                setAuthInitialized(true);
            }
        };
        
        initializeUser();

        // Set up auth state listener only once
        const { data: { subscription } } = SupabaseAuth.onAuthStateChange(
            async (event, session) => {
                console.log('🔐 Supabase auth event:', event, session?.user?.email);
                
                if (event === 'SIGNED_IN' && session?.user) {
                    console.log('✅ User signed in, updating state');
                    setUser(session.user);
                    setIsAuthenticated(true);
                    setIsLoading(false);
                    
                    // Force redirect to Dashboard after successful login
                    const currentPath = window.location.pathname;
                    if (currentPath === '/Login' || currentPath === '/Register') {
                        console.log('🚀 Redirecting to Dashboard after login');
                        setTimeout(() => {
                            window.location.href = '/Dashboard';
                        }, 100);
                    }
                } else if (event === 'SIGNED_OUT') {
                    console.log('👋 User signed out');
                    setUser(null);
                    setIsAuthenticated(false);
                    setIsLoading(false);
                } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                    console.log('🔄 Token refreshed');
                    setUser(session.user);
                    setIsAuthenticated(true);
                }
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, [authInitialized]);

    // Expose current user globally for Paddle integration
    useEffect(() => {
        if (user) {
            window.currentUser = {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                plan_level: user.plan_level || 'free',
                paddleCustomerId: user.paddle_customer_id || null
            };
        } else {
            window.currentUser = null;
        }
    }, [user]);

    const signIn = async (email, password) => {
        const { data, error } = await SupabaseAuth.signIn(email, password);
        return { data, error };
    };

    const signUp = async (email, password, options) => {
        const { data, error } = await SupabaseAuth.signUp(email, password, options);
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await SupabaseAuth.signOut();
        return { error };
    };

    const signInWithGoogle = async () => {
        const { data, error } = await SupabaseAuth.signInWithGoogle();
        return { data, error };
    };

    const updateUserProfile = async (updates) => {
        const { data, error } = await SupabaseAuth.updateUser(updates);
        return { data, error };
    };

    const currentPath = window.location.pathname;
    const isPublicPage = ['/', '/Home', '/Features', '/Pricing', '/About', '/Contact', '/Terms', '/Privacy', '/SupabaseOnly', '/Login', '/Register', '/ForgotPassword', '/Faq', '/Refund'].includes(currentPath);
    
    if (isLoading) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-4">
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d644f855b_smalllogo.png" 
                            alt="Logo" 
                            className="w-14 h-14 rounded-lg animate-pulse"
                        />
                        <h1 className="text-4xl font-bold">Your App</h1>
                    </div>
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
            </div>
        );
    }
    
    // Only redirect if user is trying to access protected routes
    const protectedRoutes = ['/Dashboard', '/Projects', '/Settings', '/Project', '/Import'];
    const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
    
    if (!isLoading && !isAuthenticated && isProtectedRoute) {
        console.log('Redirecting to Login from protected route:', currentPath);
        window.location.href = '/Login';
        return null;
    }
    
    // Debug auth state
    console.log('UserProvider state:', { 
        hasUser: !!user, 
        userEmail: user?.email,
        isLoading, 
        isAuthenticated,
        authInitialized 
    });

    return (
        <UserContext.Provider value={{ 
            user, 
            isLoading, 
            isAuthenticated, 
            setUser,
            signIn,
            signUp,
            signOut,
            signInWithGoogle,
            updateUserProfile
        }}>
            {children}
        </UserContext.Provider>
    );
};
