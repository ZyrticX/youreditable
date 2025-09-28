import React from 'react';
import MarketingHeader from './MarketingHeader';
import MarketingFooter from './MarketingFooter';

export default function MarketingLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#030303] text-white">
            <style>{`
                .glass-card { 
                  background: rgba(255, 255, 255, 0.02);
                  backdrop-filter: blur(20px);
                  border: 1px solid rgba(255, 255, 255, 0.05);
                  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }
                .neumorphic-btn {
                  background: linear-gradient(135deg, #8662EE 0%, #9A5FEF 100%);
                  box-shadow: 0 8px 32px rgba(134, 98, 238, 0.3);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  transition: all 0.3s ease;
                }
                .neumorphic-btn:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 12px 40px rgba(134, 98, 238, 0.4);
                }
            `}</style>
            <MarketingHeader />
            <main className="pt-20">
                {children}
            </main>
            <MarketingFooter />
        </div>
    );
}