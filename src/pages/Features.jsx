
import React from 'react';
import MarketingLayout from '../components/marketing/MarketingLayout';
import { Folder, Link as LinkIcon, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { User } from '@/api/entities';
import GradientCard from '../components/ui/GradientCard';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: Folder,
    title: "Simple Project Creation",
    description: "Import videos directly from Google Drive with one click. No complicated uploads or file management."
  },
  {
    icon: LinkIcon,
    title: "Sharable Client Links",
    description: "Generate secure, time-limited review links that work on any device. No logins required for clients."
  },
  {
    icon: Zap,
    title: "Automated Pipeline",
    description: "Track approval status automatically. Get notified when feedback comes in or when projects are approved."
  },
  {
    icon: BarChart3,
    title: "Centralized Dashboard",
    description: "Manage all projects, feedback, and revisions in one place. Never lose track of client communications again."
  },
];

const HowItWorksSection = () => (
    <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto fade-in-up">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-light mb-4">How It Works</h2>
                <p className="text-xl text-gray-300">Three simple steps to professional video reviews</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { step: "01", title: "Create Project", description: "Import videos from Google Drive with a simple folder link.", icon: Folder },
                    { step: "02", title: "Share Secure Link", description: "Generate a time-limited review link that works on any device.", icon: LinkIcon },
                    { step: "03", title: "Track & Approve", description: "Get real-time notifications for feedback and approvals.", icon: BarChart3 }
                ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className="text-center">
                        <div className="glass-card rounded-2xl p-8 mb-6">
                            <div className="gradient-bg w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"><item.icon className="w-8 h-8" /></div>
                            <div className="text-3xl font-light text-purple-300 mb-4">{item.step}</div>
                            <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                            <p className="text-gray-300 leading-relaxed">{item.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

const CtaSection = () => {
    const handleLogin = async () => {
        try { await User.login(); } catch (e) { console.error(e); }
    };
    return (
        <section className="py-12 px-6">
            <div className="max-w-4xl mx-auto text-center fade-in-up">
                <div className="glass-card rounded-2xl p-12">
                    <h2 className="text-3xl md:text-4xl font-light mb-6">Ready to manage edits like a pro?</h2>
                    <Button onClick={handleLogin} size="lg" className="neumorphic-btn text-lg px-8 py-4">
                        Try Editable Free <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default function FeaturesPage() {
    const navigate = useNavigate();

    return (
        <MarketingLayout>
            <div className="pt-24">
                <HowItWorksSection />

                {/* Core Features Grid */}
                <div className="py-20 px-4 lg:px-6">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.8 }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Everything You Need for Seamless Reviews
                            </h2>
                            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                                Editable combines simplicity with powerful features to streamline your entire video review process.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <GradientCard
                                        width="100%"
                                        height="auto"
                                        glowIntensity="normal"
                                        gradientColors={{
                                            primary: `rgba(${139 + (index * 20) % 100}, ${92 + (index * 15) % 100}, 246, 0.6)`,
                                            secondary: "rgba(79, 70, 229, 0)",
                                            accent: `rgba(${168 + (index * 25) % 100}, ${85 + (index * 20) % 100}, 247, 0.6)`
                                        }}
                                        className="p-8 h-full"
                                    >
                                        <div className="text-center h-full flex flex-col">
                                            <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-violet-500/30">
                                                <feature.icon className="w-8 h-8 text-violet-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                                            <p className="text-gray-400 leading-relaxed flex-grow">{feature.description}</p>
                                        </div>
                                    </GradientCard>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <CtaSection />
            </div>
        </MarketingLayout>
    );
}
