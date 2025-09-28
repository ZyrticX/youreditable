
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, PlayCircle, Target, Link2, RotateCcw, Heart, CheckCircle, Bell, Shield, Plus, Check, Crown, Folder, Zap, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import HeroGeometric from '../components/ui/HeroGeometric';
import GradientCard from '../components/ui/GradientCard';
import MarketingHeader from '../components/marketing/MarketingHeader';
import MarketingFooter from '../components/marketing/MarketingFooter';
import { useUser } from '../components/auth/UserProvider';

// Features data
const features = [
{
  icon: Folder,
  title: "Simple Project Creation",
  description: "Import videos directly from Google Drive with one click. No complicated uploads or file management."
},
{
  icon: Link2,
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
}];

const commonFeatures = [
"Client Review Management",
"Smart Notifications",
"Shareable Review Links (no sign-up needed)",
"Google Drive Integration",
"Secure & Simple Dashboard",
"No File Uploads - Paste Drive Link Only"];

// Pricing data
const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out Editable',
    mainFeature: 'Up to 3 active projects',
    pricing: {
      monthly: { price: '$0', period: '' },
      annually: { price: '$0', period: '' }
    },
    features: commonFeatures,
    recommended: false
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    description: 'For growing video creators',
    mainFeature: 'Up to 12 active projects',
    pricing: {
      monthly: { price: '$17', period: '/month' },
      annually: { price: '$169', period: '/year', savings: '$35', monthlyEquivalent: '$14.08' }
    },
    features: commonFeatures,
    recommended: true
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professional teams',
    mainFeature: 'Unlimited active projects',
    pricing: {
      monthly: { price: '$29', period: '/month' },
      annually: { price: '$289', period: '/year', savings: '$59', monthlyEquivalent: '$24.08' }
    },
    features: commonFeatures,
    recommended: false
  }
};

const plans = Object.values(PRICING_PLANS);

// FAQ data
const faqData = [
{
  question: "How do I import videos from Google Drive?",
  answer: "Simply paste your Google Drive folder link when creating a new project. Editable will automatically detect and import all video files."
},
{
  question: "Do my clients need to create an account?",
  answer: "No! Clients can review videos and leave feedback using just the secure link you share with them. No signup required."
},
{
  question: "How long do review links last?",
  answer: "By default, review links expire after 7 days for security. Pro users can customize the expiry time or make links permanent."
},
{
  question: "Can I track when clients view my videos?",
  answer: "Yes! You'll get notifications when clients open the review link and when they submit feedback or approvals."
},
{
  question: "What video formats are supported?",
  answer: "We support all major video formats including MP4, MOV, AVI, and MKV. Videos are streamed directly from Google Drive."
},
{
  question: "Is there a mobile app?",
  answer: "Yes! Editable have a mobile app and it works perfectly in any web browser on mobile, tablet, or desktop. But no app download required for you or your clients."
}];

// Existing data
const WhyEditableFeatures = [
{ icon: Target, title: "3-Click Project Setup", text: "Just paste a Google Drive link. Your review project is ready in seconds. No complex uploads." },
{ icon: Link2, title: "Frictionless Client Review", text: "Send clients a single link. They can play, pause, and comment directly on the video. No sign-up needed." },
{ icon: RotateCcw, title: "Organized Feedback Loop", text: "All notes are time-stamped and organized. Come back later, you edit, they review. Editable tracks it all." },
{ icon: Heart, title: "End the Chaos", text: "Fewer messages, more progress. No more WhatsApp chaos or endless email threads. Just peace of mind." }];

const EditorTestimonials = [
{
  name: "Sarah Chen",
  role: "Video Editor, Creative Studio",
  quote: "Editable saved me 10 hours a week. No more chasing clients for feedback or deciphering confusing email chains. It's a game-changer.",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
},
{
  name: "Mike Rodriguez",
  role: "Freelance Editor",
  quote: "Finally, a tool that makes client reviews simple and professional. My clients love how easy it is to leave precise feedback. Highly recommended.",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
},
{
  name: "Emma Thompson",
  role: "Post-Production Lead, Media House",
  quote: "Our approval times have been cut in half. The clarity of time-stamped notes means we get revisions right the first time. Absolutely essential for our workflow.",
  avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
}];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

// Billing toggle component
const BillingToggle = ({ isAnnual, onToggle }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
      <div className="flex items-center gap-4">
        <span className={`text-lg font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>
          Monthly
        </span>
        <Switch
          checked={isAnnual}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-purple-600" 
        />
        <span className={`text-lg font-medium transition-colors ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
          Annually
        </span>
      </div>
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs font-semibold">
        Save 2 Months
      </Badge>
    </div>
  );
};

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUser();
  const [isAnnual, setIsAnnual] = useState(false);
  const [openItems, setOpenItems] = useState(new Set());

  // No automatic redirect - let users stay on home page even if logged in

  const handleCTA = (path) => {
    if (path === '/dashboard') {
      navigate(createPageUrl('Dashboard'));
    } else if (path === '/login') {
      window.location.href = 'https://youreditable.com/Dashboard';
    } else {
      navigate(path);
    }
  };

  const getCurrentPrice = (plan) => {
    if (isAnnual) {
      return plan.pricing.annually.price;
    }
    return plan.pricing.monthly.price;
  };

  const handlePlanSelect = (planId) => {
    window.location.href = 'https://youreditable.com/Dashboard';
  };

  const toggleItem = (index) => {
    setOpenItems((prevOpenItems) => {
      const newSet = new Set(prevOpenItems);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Home page is now accessible to everyone - no redirects

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
          -webkit-mask-composite: xor;
          mask-composite: xor;
        }
        .theme-aware-btn:hover {
          transform: translateY(-2px);
          background: rgba(40, 40, 40, 0.9);
          box-shadow: 0 10px 30px rgba(168, 85, 247, 0.3);
        }
        .theme-aware-btn:hover::before {
          background: linear-gradient(45deg, rgba(168, 85, 247, 0.8), rgba(56, 189, 248, 0.6), rgba(244, 114, 182, 0.7));
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      
      <main>
        {/* 1. Hero Section */}
        <HeroGeometric
          badge="Transform Your Video Review Process"
          title1="Get Client Feedback"
          title2="Without The Chaos"
          description="Share Google Drive videos instantly. Collect timestamped feedback. Approve projects faster. No uploads, no confusion—just results."
        >
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
          >
            <button
              onClick={() => handleCTA('/login')}
              className="theme-aware-btn"
            >
              Start Free Trial
            </button>
            
            {/* Admin Dashboard Access Button - visible only for admin users */}
            {user && user.role === 'admin' && (
              <Button
                onClick={() => handleCTA('/dashboard')}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 h-auto bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
              >
                Go to Dashboard
              </Button>
            )}

            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/10 text-lg px-8 py-4 h-auto"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <PlayCircle className="mr-2 w-6 h-6" />
              Watch Demo
            </Button>
          </motion.div>
        </HeroGeometric>

        {/* 2. Why Editable? Section */}
        <section className="px-4 md:py-32">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              className="text-center mb-16 md:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                You're an editor. Not a project manager.
              </h2>
              <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
                The "fixing loop" — where you send drafts and get vague feedback — is what you dread most. Editable cleans it up so you can get back to creating.
              </p>
            </motion.div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {WhyEditableFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                >
                  <GradientCard
                    width="100%"
                    height="auto"
                    glowIntensity="subtle"
                    gradientColors={{
                      primary: "rgba(139, 92, 246, 0.6)",
                      secondary: "rgba(79, 70, 229, 0)",
                      accent: "rgba(168, 85, 247, 0.6)"
                    }}
                    className="p-6"
                  >
                    <div className="flex items-start text-left gap-5">
                      <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-violet-500/20">
                        <feature.icon className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white mb-1">{feature.title}</h3>
                        <p className="text-gray-400 leading-relaxed">{feature.text}</p>
                      </div>
                    </div>
                  </GradientCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 3. Features Section */}
        <section id="features" className="py-20 md:py-32 px-4 lg:px-6 bg-black/20">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                    height="320px"
                    glowIntensity="normal"
                    gradientColors={{
                      primary: `rgba(${139 + index * 20 % 100}, ${92 + index * 15 % 100}, 246, 0.6)`,
                      secondary: "rgba(79, 70, 229, 0)",
                      accent: `rgba(${168 + index * 25 % 100}, ${85 + index * 20 % 100}, 247, 0.6)`
                    }}
                    className="p-8"
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
        </section>

        {/* 4. Testimonials Section */}
        <section className="py-20 md:py-32 px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.8 }}
              className="text-center mb-16 md:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                Loved by Editors Like You
              </h2>
            </motion.div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
            >
              {EditorTestimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                >
                  <GradientCard
                    width="100%"
                    height="auto"
                    glowIntensity="normal"
                    gradientColors={{
                      primary: "rgba(56, 189, 248, 0.7)",
                      secondary: "rgba(79, 70, 229, 0)",
                      accent: "rgba(139, 92, 246, 0.7)"
                    }}
                    className="p-8"
                  >
                    <div className="text-center flex flex-col h-full">
                      <p className="text-gray-300 mb-6 leading-relaxed italic flex-grow">"{testimonial.quote}"</p>
                      <div className="flex items-center justify-center gap-4">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-violet-500/30"
                        />
                        <div>
                          <p className="text-white font-medium">{testimonial.name}</p>
                          <p className="text-gray-400 text-sm">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </GradientCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        {/* 5. Pricing Section */}
        <section id="pricing" className="py-20 md:py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl mb-6 font-bold md:text-6xl">Simple Pricing</h2>
              <p className="text-2xl mx-auto text-lg max-w-3xl text-gray-400">Choose the plan that fits your project needs</p>
            </motion.div>

            <BillingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GradientCard
                    width="100%"
                    height="auto"
                    glowIntensity={plan.recommended ? 'intense' : 'normal'}
                    gradientColors={
                      plan.id === 'pro' ? {
                        primary: "rgba(168, 85, 247, 0.8)",
                        secondary: "rgba(79, 70, 229, 0)",
                        accent: "rgba(244, 114, 182, 0.8)"
                      } : plan.id === 'basic' ? {
                        primary: "rgba(245, 158, 11, 0.7)",
                        secondary: "rgba(79, 70, 229, 0)",
                        accent: "rgba(251, 191, 36, 0.7)"
                      } : {
                        primary: "rgba(59, 130, 246, 0.6)",
                        secondary: "rgba(79, 70, 229, 0)",
                        accent: "rgba(96, 165, 250, 0.6)"
                      }
                    }
                    className={`relative ${plan.recommended ? 'ring-2 ring-violet-500/50' : ''}`}
                  >
                    <div className="p-8 h-full flex flex-col">
                      <div className="text-center mb-8 flex-grow">
                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="mb-4">
                          <div className="flex items-baseline justify-center">
                            <span className="text-5xl font-bold text-white">{getCurrentPrice(plan)}</span>
                            {plan.pricing.monthly.period && (
                              <span className="text-gray-400 ml-2">
                                /{isAnnual ? 'year' : 'month'}
                              </span>
                            )}
                          </div>
                          {isAnnual && plan.id !== 'free' && plan.pricing.annually.savings && (
                            <div className="mt-2">
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Save {plan.pricing.annually.savings} per year
                              </Badge>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 mb-6">{plan.description}</p>
                        
                        <p className="font-medium text-white text-lg mb-4">{plan.mainFeature}</p>
                        
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-300 mb-2">Everything included:</h4>
                          <ul className="space-y-2">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start">
                                <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <Button
                        onClick={() => handlePlanSelect(plan.id)}
                        className="w-full neumorphic-btn mt-6"
                        size="lg"
                      >
                        Try Now
                      </Button>
                    </div>
                  </GradientCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section id="faq" className="py-20 md:py-32 px-4 lg:px-6 bg-black/20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-400">Everything you need to know about Editable</p>
            </motion.div>

            <div className="space-y-4">
              {faqData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GradientCard
                    width="100%"
                    height="auto"
                    glowIntensity="subtle"
                    gradientColors={{
                      primary: "rgba(139, 92, 246, 0.3)",
                      secondary: "rgba(79, 70, 229, 0)",
                      accent: "rgba(168, 85, 247, 0.3)"
                    }}
                    className="overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full p-6 text-left focus:outline-none"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white pr-8">{item.question}</h3>
                        <motion.div
                          animate={{ rotate: openItems.has(index) ? 45 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Plus className="w-5 h-5 text-violet-400 flex-shrink-0" />
                        </motion.div>
                      </div>
                      
                      <motion.div
                        initial={false}
                        animate={{
                          height: openItems.has(index) ? 'auto' : 0,
                          opacity: openItems.has(index) ? 1 : 0
                        }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 text-gray-400 leading-relaxed">
                          {item.answer}
                        </div>
                      </motion.div>
                    </button>
                  </GradientCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Final CTA Section */}
        <section className="py-20 md:py-32 px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <GradientCard
                width="100%"
                height="auto"
                glowIntensity="intense"
                gradientColors={{
                  primary: "rgba(168, 85, 247, 0.8)",
                  secondary: "rgba(79, 70, 229, 0)",
                  accent: "rgba(244, 114, 182, 0.8)"
                }}
                className="p-8 md:p-16"
              >
                <div className="text-center">
                  <h2 className="text-3xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-white to-rose-300">
                    Try Editable Free. You'll Never Go Back.
                  </h2>
                  <p className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed">
                    You'll wonder how you ever dealt with feedback before. Editable isn't a luxury — it's a necessity for editors who value their time.
                  </p>
                  <button onClick={() => handleCTA('/login')} className="theme-aware-btn">
                    Start Editing Smarter
                  </button>
                </div>
              </GradientCard>
            </motion.div>
          </div>
        </section>
      </main>
      
      <MarketingFooter />
    </div>
  );
}
