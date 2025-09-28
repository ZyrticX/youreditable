import React from 'react';
import MarketingLayout from '../components/marketing/MarketingLayout';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
    return (
        <MarketingLayout>
            <div className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl fade-in-up">Privacy Policy</h1>
                        <p className="mt-4 text-lg text-gray-400 fade-in-up" style={{ animationDelay: '0.2s' }}>Last updated: August 17, 2025</p>
                    </div>

                    <Card className="glass-card">
                        <CardContent className="p-8 prose prose-invert max-w-none prose-h2:text-white prose-h2:font-semibold prose-strong:text-white prose-a:text-violet-400 hover:prose-a:text-violet-300">
                            <p>
                                <strong>Business Name:</strong> Roy Belo (DBA Editable)<br/>
                                <strong>Business ID:</strong> 201627596<br/>
                                <strong>Business Address:</strong> Harav Maymon 5, Israel<br/>
                                <strong>Contact Email:</strong> <a href="mailto:youreditable@gmail.com">youreditable@gmail.com</a>
                            </p>

                            <h2>1. Introduction</h2>
                            <p>Editable (“we,” “us,” or “our”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform located at <a href="https://editable.so" target="_blank" rel="noopener noreferrer">https://editable.so</a>, or any related services.</p>
                            <p>By using our service, you agree to the collection and use of information in accordance with this policy.</p>

                            <h2>2. What We Collect</h2>
                            <p>We collect only the minimum information required to operate the Editable platform and support your experience:</p>
                            <ul>
                                <li><strong>Account Information</strong>: Your name, email address, and business name (if provided).</li>
                                <li><strong>Subscription & Payment Data</strong>: Managed securely by our third-party billing provider, <strong>Paddle.com</strong>. We do not store your credit card or banking information.</li>
                                <li><strong>Usage Data</strong>: We collect anonymized analytics about your use of the platform (e.g., how many projects you manage), strictly for performance and improvement.</li>
                            </ul>
                            <blockquote>🚫 <strong>We do not access, host, or store your video files.</strong> You control access via <strong>Google Drive links</strong>.</blockquote>
                            
                            <h2>3. How We Use the Data</h2>
                            <p>Your data is used to:</p>
                            <ul>
                                <li>Provide access to your Editable account.</li>
                                <li>Manage your subscription and billing via Paddle.</li>
                                <li>Improve service quality and user experience.</li>
                                <li>Respond to support inquiries.</li>
                            </ul>
                            <p>We never sell or rent your data to third parties.</p>
                            
                            <h2>4. Google Drive Integration</h2>
                            <p>When you connect or share a <strong>Google Drive link</strong>, you’re sharing access to content you manage. We never duplicate, download, or store your files on our servers. You are solely responsible for the permissions you grant on those files.</p>
                            
                            <h2>5. Data Retention & Deletion</h2>
                            <p>You may delete your account at any time. Upon deletion:</p>
                            <ul>
                                <li>Your account data will be permanently erased from our systems within 30 days.</li>
                                <li>We will retain only legally required billing records, managed via Paddle.</li>
                            </ul>
                            <p>To request deletion: Email us at <a href="mailto:youreditable@gmail.com">youreditable@gmail.com</a></p>
                            
                            <h2>6. Cookies & Analytics</h2>
                            <p>We may use essential cookies for performance and navigation. We may use analytics tools to understand general usage patterns. No personal identifiers are stored or tracked unless explicitly permitted.</p>
                            
                            <h2>7. Third-Party Services</h2>
                            <p>We use third-party providers to operate our service securely, such as:</p>
                            <ul>
                                <li><strong>Paddle.com</strong> – Subscription billing and tax compliance</li>
                                <li><strong>Google APIs</strong> – Project management and file linking (optional)</li>
                                <li><strong>Cloud hosting providers</strong> – To deliver the Editable interface and service</li>
                            </ul>
                            <p>Each provider follows industry-standard privacy and security practices.</p>
                            
                            <h2>8. Data Transfers</h2>
                            <p>As we operate globally, your data may be processed on servers outside of your country of residence. By using our service, you consent to such transfer in accordance with applicable laws.</p>
                            
                            <h2>9. Your Rights</h2>
                            <p>Depending on your jurisdiction (e.g., EU, U.S., Israel), you may have the right to:</p>
                            <ul>
                                <li>Access or update your data.</li>
                                <li>Request deletion of your account.</li>
                                <li>Withdraw consent for communications.</li>
                            </ul>
                            <p>To exercise any of these rights, contact: <a href="mailto:youreditable@gmail.com">youreditable@gmail.com</a></p>
                            
                            <h2>10. Changes to This Policy</h2>
                            <p>We reserve the right to update this Privacy Policy. Any changes will be reflected on this page with the updated effective date.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MarketingLayout>
    );
}