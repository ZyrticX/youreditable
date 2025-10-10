import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import { useUser } from '../auth/UserProvider';

export default function MarketingHeader() {
    const navigate = useNavigate();
    const { isAuthenticated, user, signOut } = useUser();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleCTA = (path) => {
        if (path === '/login') {
            window.location.href = 'https://youreditable.com/Dashboard';
        } else {
            navigate(path);
        }
        setIsMenuOpen(false);
    };

    const handleNavClick = (sectionId) => {
        // If we're not on the Home page, navigate there first
        if (window.location.pathname !== createPageUrl("Home")) {
            navigate(createPageUrl("Home"));
            // Wait a bit for navigation to complete, then scroll
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
        setIsMenuOpen(false);
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: createPageUrl("Home") },
        { name: 'About Us', path: createPageUrl("About") },
        { name: 'Features', sectionId: 'features' },
        { name: 'Pricing', sectionId: 'pricing' },
        { name: 'FAQ', sectionId: 'faq' },
    ];

    return (
        <>
            <motion.header 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`fixed top-0 left-0 right-0 z-50 p-4 transition-all duration-300`}
            >
                <div className={`max-w-7xl mx-auto flex items-center justify-between p-3 rounded-2xl transition-all duration-300 ${isScrolled ? 'bg-black/30 backdrop-blur-lg border border-white/10' : 'bg-transparent border-transparent'}`}>
                    <Link to={createPageUrl("Home")} className="flex items-center gap-3">
                        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d644f855b_smalllogo.png" alt="Editable Logo" className="w-8 h-8" />
                        <span className="text-xl font-bold text-white">Editable</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map(link => (
                            link.path ? (
                                <Link 
                                    key={link.name}
                                    to={link.path}
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ) : (
                                <button 
                                    key={link.name} 
                                    onClick={() => handleNavClick(link.sectionId)}
                                    className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                                >
                                    {link.name}
                                </button>
                            )
                        ))}
                    </nav>
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="relative">
                                <Button 
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    variant="ghost" 
                                    className="text-white hover:bg-white/10 flex items-center gap-2"
                                >
                                    <User className="w-4 h-4" />
                                    {user?.email?.split('@')[0] || 'User'}
                                </Button>
                                {userMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-lg py-2 z-50">
                                        <button
                                            onClick={() => {
                                                navigate('/Dashboard');
                                                setUserMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-white hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <User className="w-4 h-4" />
                                            Dashboard
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/Settings');
                                                setUserMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-white hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </button>
                                        <hr className="my-2 border-slate-700" />
                                        <button
                                            onClick={async () => {
                                                await signOut();
                                                setUserMenuOpen(false);
                                                navigate('/Home');
                                            }}
                                            className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Button onClick={() => handleCTA('/login')} variant="ghost" className="text-white hover:bg-white/10">Log In</Button>
                                <Button onClick={() => handleCTA('/login')} className="neumorphic-btn">Start Free</Button>
                            </>
                        )}
                    </div>
                    <div className="md:hidden">
                        <Button onClick={() => setIsMenuOpen(true)} variant="ghost" size="icon" className="text-white">
                            <Menu />
                        </Button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-[#0A0A0A] border-l border-white/10 p-6"
                    >
                        <div className="flex justify-end mb-8">
                            <Button onClick={() => setIsMenuOpen(false)} variant="ghost" size="icon" className="text-white">
                                <X />
                            </Button>
                        </div>
                        <nav className="flex flex-col gap-6 text-center">
                            {navLinks.map(link => (
                                link.path ? (
                                    <Link 
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-gray-300 hover:text-white transition-colors text-xl"
                                    >
                                        {link.name}
                                    </Link>
                                ) : (
                                    <button 
                                        key={link.name} 
                                        onClick={() => handleNavClick(link.sectionId)}
                                        className="text-gray-300 hover:text-white transition-colors text-xl cursor-pointer"
                                    >
                                        {link.name}
                                    </button>
                                )
                            ))}
                        </nav>
                        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col gap-4">
                            {isAuthenticated ? (
                                <>
                                    <Button 
                                        onClick={() => {
                                            navigate('/Dashboard');
                                            setIsMenuOpen(false);
                                        }}
                                        variant="outline" 
                                        className="w-full text-white border-white/20 hover:bg-white/10 flex items-center gap-2"
                                    >
                                        <User className="w-4 h-4" />
                                        Dashboard
                                    </Button>
                                    <Button 
                                        onClick={() => {
                                            navigate('/Settings');
                                            setIsMenuOpen(false);
                                        }}
                                        variant="outline" 
                                        className="w-full text-white border-white/20 hover:bg-white/10 flex items-center gap-2"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Button>
                                    <Button 
                                        onClick={async () => {
                                            await signOut();
                                            setIsMenuOpen(false);
                                            navigate('/Home');
                                        }}
                                        variant="outline" 
                                        className="w-full text-red-400 border-red-400/20 hover:bg-red-400/10 flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={() => handleCTA('/login')} variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">Log In</Button>
                                    <Button onClick={() => handleCTA('/login')} className="w-full neumorphic-btn">Start Free</Button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}