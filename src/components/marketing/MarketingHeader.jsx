import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function MarketingHeader() {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                        <Button onClick={() => handleCTA('/login')} variant="ghost" className="text-white hover:bg-white/10">Log In</Button>
                        <Button onClick={() => handleCTA('/login')} className="neumorphic-btn">Start Free</Button>
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
                            <Button onClick={() => handleCTA('/login')} variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">Log In</Button>
                            <Button onClick={() => handleCTA('/login')} className="w-full neumorphic-btn">Start Free</Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}