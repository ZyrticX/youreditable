
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MarketingHeader from '../components/marketing/MarketingHeader';
import MarketingFooter from '../components/marketing/MarketingFooter';
import HeroGeometric from '../components/ui/HeroGeometric';
import GradientCard from '../components/ui/GradientCard';
import { useUser } from '../components/auth/UserProvider';

// Image URLs from user upload
const royPortraitUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6fb092f24_royportrait.png";
const onTvUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b7f8804f2_ontv.png";
const inACrowdedRoomUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f993881d0_inacrowdedroom.png";
const presentingUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e8e2c4a64_da39f39d-e8b2-4fb3-98c5-0af6703560cd.jpg";

export default function AboutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUser();

  // Redirect logged-in (non-admin) users to Dashboard
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      navigate(createPageUrl('Dashboard'));
    }
  }, [isAuthenticated, user, navigate]);

  const handleCTA = (path) => {
    if (path === '/login') {
      window.location.href = 'https://youreditable.com/Dashboard';
    } else {
      navigate(path);
    }
  };

  // If a non-admin user is authenticated, show redirecting message
  if (isAuthenticated && user && user.role !== 'admin') {
    return (
      <div className="bg-[#030303] text-white min-h-screen flex items-center justify-center">
        <p>Redirecting to Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#030303] text-white">
      <MarketingHeader />
      <style>{`
          .theme-aware-btn {
            position: relative;
            background: rgba(30, 30, 30, 0.8);
            border: 1px solid transparent;
            border-radius: 9999px;
            padding: 16px 32px;
            font-size: 18px;
            font-weight: 500;
            color: white;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            overflow: hidden;
            cursor: pointer;
          }
          .theme-aware-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            padding: 1px;
            background: linear-gradient(45deg, rgba(168, 85, 247, 0.5), rgba(56, 189, 248, 0.3), rgba(244, 114, 182, 0.4));
            border-radius: inherit;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: xor;
            -webkit-mask-composite: xor;
          }
          .theme-aware-btn:hover {
            transform: translateY(-2px);
            background: rgba(40, 40, 40, 0.9);
            box-shadow: 0 10px 30px rgba(168, 85, 247, 0.3);
          }
          .theme-aware-btn:hover::before {
            background: linear-gradient(45deg, rgba(168, 85, 247, 0.8), rgba(56, 189, 248, 0.6), rgba(244, 114, 182, 0.7));
          }
      `}</style>
      <main>
        <HeroGeometric
          badge="Our Story"
          title1="Built by an Editor."
          title2="For Editors."
          description="The story behind the 'why' of Editable"
          isCompact={true}
        />

        {/* Founder Section - reduced top padding */}
        <section className="py-8 md:py-16 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <img src={royPortraitUrl} alt="Roy Belo, Founder of Editable" className="rounded-2xl w-full h-auto object-cover shadow-2xl shadow-violet-900/20" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-lg md:text-xl text-gray-400 space-y-6 leading-relaxed">
                <p>
                  Editable was founded by Roy Belo, a video editor turned content creator, director, and agency owner — who's spent the last decade on both sides of the client loop.
                </p>
                <p>
                  From editing his first videos solo to directing national campaigns and acting in tens of thousands of social videos and TV commercials, Roy's been deep in the mess we all know too well: vague client feedback, version 7B, WhatsApp chaos, and missed notes at midnight.
                </p>
                 <p>
                  He built Editable not as a Silicon Valley startup dream — but as a real solution to a real editor problem.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* We're an Upgrade Section */}
        <section className="py-12 md:py-16 px-4 bg-black/20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                We're Not a Startup. We're an Upgrade.
              </h2>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                Editable is how editors *should* manage client reviews: simple, click-and-go, and editor-first. You don't need to "learn" Editable. You paste a link, send it, and edit in peace. That's it.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-6 rounded-2xl overflow-hidden"
              >
                <img src={onTvUrl} alt="Roy Belo on TV" className="w-full h-full object-cover" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-4 rounded-2xl overflow-hidden"
              >
                <img src={inACrowdedRoomUrl} alt="Roy Belo presenting" className="w-full h-full object-cover" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-10 rounded-2xl overflow-hidden"
              >
                <img src={presentingUrl} alt="Roy Belo speaking at an event" className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* The Vision Section */}
        <section className="py-12 md:py-16 px-4 bg-black/20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                The Vision: Let Editors Edit
              </h2>
              <p className="text-lg md:text-xl text-gray-400 mb-8 leading-relaxed">
                This is just the beginning. We're building Editable into a full suite of pre-edit and post-edit tools — so you can stop being a project manager and get back to your real job: editing great videos.
              </p>
              <div className="text-lg text-white font-medium space-y-2">
                <p>No more version wars.</p>
                <p>No more wasted hours.</p>
                <p>No more babysitting clients.</p>
              </div>
              <p className="text-lg md:text-xl text-gray-400 mt-8 leading-relaxed">
                Whether you're a solo freelancer or an in-house post-production lead — Editable helps you stay in flow, instead of chasing approvals.
              </p>
              <p className="text-lg md:text-xl text-white font-semibold mt-4 leading-relaxed">
                Just clear, fast, editor-owned workflow — from someone who lives it too.
              </p>
              <p className="mt-12 text-gray-400">From Israel, to Editors Everywhere. We're proudly based in Israel — and proudly global. If you edit video for a living, this was made for you.</p>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <GradientCard width="100%" height="auto" className="p-8 md:p-16" glowIntensity="intense">
              <div className="text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Ready to Transform Your Workflow?
                </h2>
                <p className="text-lg text-gray-400 mb-8">
                  Join hundreds of editors who have streamlined their review process.
                </p>
                <button onClick={() => handleCTA('/login')} className="theme-aware-btn">
                  Get Started for Free
                </button>
              </div>
            </GradientCard>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
