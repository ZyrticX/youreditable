import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupabaseAuth } from '@/api/entities';
import { Loader2 } from 'lucide-react';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const currentPath = window.location.pathname;
        const isPublicPage = ['/', '/Home', '/Features', '/Pricing', '/About', '/Contact', '/Terms', '/Privacy', '/SupabaseOnly', '/Faq', '/Refund'].includes(currentPath);
        
        const initializeUser = async () => {
            setIsLoading(true);
            try {
                // Only check authentication for protected routes or when explicitly needed
                if (!isPublicPage) {
                    const { session } = await SupabaseAuth.getCurrentSession();
                    
                    if (session?.user) {
                        setUser(session.user);
                        setIsAuthenticated(true);
                    } else {
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                } else {
                    // For public pages, just check if there's a session without redirecting
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
                        // Silently fail for public pages
                    setUser(null);
                    setIsAuthenticated(false);
                    }
                }
            } catch (error) {
                console.log("Authentication check failed:", error.message);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        
        initializeUser();

        const { data: { subscription } } = SupabaseAuth.onAuthStateChange(
            async (event, session) => {
                console.log('Supabase auth state changed:', event, session);
                
                if (event === 'SIGNED_IN' && session?.user) {
                    setUser(session.user);
                    setIsAuthenticated(true);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setIsAuthenticated(false);
                } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                    setUser(session.user);
                }
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

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
    
    return (
        <UserContext.Provider value={{ 
            user, 
            isLoading, 
            isAuthenticated, 
            setUser,
            signIn,
            signUp,
            signOut,
            updateUserProfile
        }}>
            {children}
        </UserContext.Provider>
    );
};
