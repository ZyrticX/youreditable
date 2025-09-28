import React from 'react';
import MarketingLayout from '../components/marketing/MarketingLayout';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
    return (
        <MarketingLayout>
            <div className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl fade-in-up">Terms of Service</h1>
                        <p className="mt-4 text-lg text-gray-400 fade-in-up" style={{ animationDelay: '0.2s' }}>Last updated: August 17, 2025</p>
                    </div>

                    <Card className="glass-card">
                        <CardContent className="p-8 prose prose-invert max-w-none prose-h2:text-white prose-h2:font-semibold prose-strong:text-white prose-a:text-violet-400 hover:prose-a:text-violet-300">
                            <p>Welcome to <strong>Editable</strong> — a video review and approval platform ("Service" or "Platform") operated by Roy Belo, operating under the brand name Editable ("we", "our", or "us").</p>
                            <p>By using our website and services, you ("User", "you", or "Client") agree to these Terms of Service ("Terms"). If you do not agree, do not use the Service.</p>
                            
                            <h2>1. Description of Service</h2>
                            <p>Editable is a web-based platform that allows video editors to manage video review workflows by sharing Google Drive links, collecting timestamped feedback, and managing approvals. All content remains on your Google Drive.</p>
                            
                            <h2>2. Account & Access</h2>
                            <p>To use Editable, you must:</p>
                            <ul>
                                <li>Be at least 18 years old.</li>
                                <li>Provide accurate account information.</li>
                                <li>Maintain the confidentiality of your login credentials.</li>
                            </ul>
                            <p>We reserve the right to suspend accounts for misuse, abuse, or violation of these Terms.</p>
                            
                            <h2>3. Subscription & Billing</h2>
                            <p>Editable offers subscription plans billed through our payment processor, <strong>Paddle</strong>. Subscription pricing is based on the number of active video projects per month. All features are included in every plan.</p>
                            <ul>
                                <li><strong>Free Plan</strong>: $0/month — 3 active projects, 3-day review link expiry.</li>
                                <li><strong>Basic Plan</strong>: $17/month — 12 active projects, 7-day review link expiry.</li>
                                <li><strong>Pro Plan</strong>: $29/month — Unlimited active projects, no link expiry.</li>
                            </ul>
                            <p>You may upgrade, downgrade, or cancel your subscription at any time via your account dashboard. Cancellation takes effect at the end of the current billing cycle.</p>
                            
                            <h2>4. Payments</h2>
                            <p>All payments are securely processed via <strong>Paddle</strong>. By subscribing, you authorize recurring billing through Paddle under their terms. Editable does not store or process payment details directly.</p>
                            
                            <h2>5. Refund Policy</h2>
                            <p><strong>No refunds.</strong> Subscriptions are non-refundable. You may cancel at any time and will retain access until the end of your billing period. No further charges will be made after cancellation.</p>
                            
                            <h2>6. Data Ownership & Storage</h2>
                            <p>Editable does <strong>not</strong> host or store your video files. You retain full control and ownership over your videos, which remain in your Google Drive. Editable only facilitates review and collaboration using those links.</p>
                            
                            <h2>7. Intellectual Property</h2>
                            <p>All content, trademarks, software, and features of Editable are the intellectual property of Roy Belo and may not be copied, distributed, or modified without written permission. You retain all rights to the content you upload or share.</p>
                            
                            <h2>8. Limitation of Liability</h2>
                            <p>Editable is provided "as-is" without warranties of any kind. We are not liable for any direct or indirect damages, including but not limited to data loss, missed deadlines, or third-party service failures (e.g., Google Drive or Paddle).</p>
                            
                            <h2>9. Termination</h2>
                            <p>We may suspend or terminate your access to the Service if you violate these Terms or engage in abusive behavior. Upon termination, your account and data may be removed.</p>
                            
                            <h2>10. Governing Law</h2>
                            <p>These Terms shall be governed by and construed in accordance with the laws of the State of Israel. Any disputes will be handled by the courts in Tel Aviv, Israel.</p>
                            
                            <h2>11. Changes to Terms</h2>
                            <p>We may update these Terms at any time. Continued use of the Service after updates constitutes acceptance of the revised Terms. Significant changes will be communicated via your registered email or in-app notifications.</p>
                            
                            <h2>12. Contact</h2>
                            <p>If you have any questions or concerns about these Terms, you may contact us:</p>
                            <p>
                                <strong>Roy Belo</strong><br/>
                                <strong>Brand</strong>: Editable<br/>
                                <strong>Email</strong>: <a href="mailto:youreditable@gmail.com">youreditable@gmail.com</a><br/>
                                <strong>Country</strong>: Israel
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MarketingLayout>
    );
}