
import React, { useState } from 'react';
import MarketingLayout from '../components/marketing/MarketingLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react'; // Updated import: removed ChevronDown, ChevronUp, added Plus
import GradientCard from '../components/ui/GradientCard'; // New import

const faqs = [
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
  }
];

export default function FaqPage() {
    // Changed state from openFaq (single item) to openItems (Set for multiple items)
    const [openItems, setOpenItems] = useState(new Set());

    // Function to toggle the open/closed state of an FAQ item
    const toggleItem = (index) => {
        setOpenItems(prevOpenItems => {
            const newSet = new Set(prevOpenItems);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    return (
        <MarketingLayout>
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto"> {/* Removed 'fade-in-up' as individual items animate */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-light mb-4">Frequently Asked Questions</h1>
                        <p className="text-xl text-gray-300">Everything you need to know about Editable</p>
                    </div>

                    {/* New div for padding around the FAQ list */}
                    <div className="py-16 md:py-20 px-4 lg:px-6">
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
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
                                                <h3 className="text-lg font-semibold text-white pr-8">{faq.question}</h3>
                                                <motion.div
                                                    animate={{ rotate: openItems.has(index) ? 45 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Plus className="w-5 h-5 text-violet-400 flex-shrink-0" />
                                                </motion.div>
                                            </div>

                                            {/* AnimatePresence is removed, motion.div directly animates height and opacity */}
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
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        </button>
                                    </GradientCard>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
