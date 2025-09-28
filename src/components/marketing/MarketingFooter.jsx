import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function MarketingFooter() {
    const navigate = useNavigate();

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
    };

    const handleCTA = () => {
        window.location.href = 'https://youreditable.com/Dashboard';
    };

    const footerNavGroups = [
        {
            title: 'Product',
            links: [
                { name: 'Features', sectionId: 'features' },
                { name: 'Pricing', sectionId: 'pricing' },
                { name: 'FAQ', sectionId: 'faq' },
            ]
        },
        {
            title: 'Company',
            links: [
                { name: 'Home', path: createPageUrl('Home') },
                { name: 'About Us', path: createPageUrl('About') },
                { name: 'Contact', path: createPageUrl('Contact') },
            ]
        },
        {
            title: 'Legal',
            links: [
                { name: 'Privacy Policy', path: createPageUrl('Privacy') },
                { name: 'Terms of Service', path: createPageUrl('Terms') },
                { name: 'Refund Policy', path: createPageUrl('Refund') },
            ]
        }
    ];
    
    return (
        <footer className="py-16 px-6 bg-[#030303] text-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
                    <div className="lg:col-span-5">
                        <Link to={createPageUrl("Home")} className="flex items-center gap-3 mb-4">
                            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d644f855b_smalllogo.png" alt="Editable Logo" className="w-8 h-8" />
                            <span className="text-xl font-bold">Editable</span>
                        </Link>
                        <p className="text-gray-400 max-w-sm">The simplest way for video editors and clients to collaborate on revisions.</p>
                    </div>
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                        {footerNavGroups.map(group => (
                            <div key={group.title}>
                                <h3 className="font-semibold mb-4 text-gray-300">{group.title}</h3>
                                <ul className="space-y-3">
                                    {group.links.map(link => (
                                        <li key={link.name}>
                                            {link.path ? (
                                                <Link to={link.path} className="text-gray-400 hover:text-white transition-colors text-sm">
                                                    {link.name}
                                                </Link>
                                            ) : (
                                                <button 
                                                    onClick={() => handleNavClick(link.sectionId)}
                                                    className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
                                                >
                                                    {link.name}
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center pt-8 border-t border-white/10">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Editable. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}