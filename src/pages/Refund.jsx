import React from 'react';
import MarketingLayout from '../components/marketing/MarketingLayout';
import { Card, CardContent } from '@/components/ui/card';

export default function RefundPage() {
    return (
        <MarketingLayout>
            <div className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl fade-in-up">Refund Policy</h1>
                        <p className="mt-4 text-lg text-gray-400 fade-in-up" style={{ animationDelay: '0.2s' }}>Last updated: August 17, 2025</p>
                    </div>
                    <Card className="glass-card">
                        <CardContent className="p-8 prose prose-invert max-w-none prose-h2:text-white prose-h2:font-semibold prose-strong:text-white prose-a:text-violet-400 hover:prose-a:text-violet-300">
                            <p>This Refund Policy applies to all subscriptions and payments made through the Editable platform (“we”, “our”, “us”), operated by Roy Belo, and billed via <strong>Paddle</strong> (our Merchant of Record and payment processor).</p>
                            
                            <h2>1. General Policy</h2>
                            <p>All payments made to Editable are <strong>non-refundable</strong>. By subscribing to our service, you acknowledge and agree that:</p>
                            <ul>
                                <li>We do <strong>not offer refunds</strong> for any billing period that has already started.</li>
                                <li>This applies whether you use the platform or not during the billing period.</li>
                            </ul>
                            <p>We believe in transparency and encourage users to take advantage of our free plan before upgrading.</p>

                            <h2>2. Subscription Cancellations</h2>
                            <p>You may cancel your subscription at any time via your account settings. Once canceled:</p>
                            <ul>
                                <li>You will <strong>retain access</strong> to your current plan and its features until the end of the paid billing cycle.</li>
                                <li>You will <strong>not be charged again</strong> unless you resubscribe.</li>
                            </ul>
                            <p>We do not offer partial refunds for unused time within an active billing cycle.</p>

                            <h2>3. Exceptional Circumstances</h2>
                            <p>Refunds may be considered on a <strong>case-by-case basis</strong> only in the following rare cases:</p>
                            <ul>
                                <li>A <strong>technical issue</strong> on our side that made the platform completely unusable <strong>and</strong> was not resolved after a reasonable amount of time.</li>
                                <li>A <strong>duplicate payment</strong> caused by system error.</li>
                            </ul>
                            <p>To request such an exception, email us at <a href="mailto:youreditable@gmail.com"><strong>youreditable@gmail.com</strong></a> with the subject line: “Refund Request” and include your account email and reason.</p>
                            <p>Please note: The final decision is at our sole discretion, and filing a dispute or chargeback through your payment provider will <strong>immediately terminate your access</strong> to the platform.</p>
                            
                            <h2>4. Responsibility & Billing Provider</h2>
                            <p>Editable is billed via <strong>Paddle</strong>, a third-party Merchant of Record. All taxes, invoices, and currency conversions are handled by Paddle, in accordance with international laws and local tax regulations.</p>
                            <p>Editable does not store or process any payment information directly.</p>

                            <h2>5. Contact Information</h2>
                            <p>If you have any questions about this Refund Policy, please contact us:</p>
                            <p>
                                <strong>Editable (Roy Belo)</strong><br/>
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