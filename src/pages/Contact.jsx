import React, { useState } from 'react';
import MarketingLayout from '../components/marketing/MarketingLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Loader2,
  MapPin,
  Clock,
  Phone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
// Contact form submission - you can implement this with Supabase Edge Functions
const sendContactEmail = async (data) => {
  console.log('Contact form submitted:', data);
  // TODO: Implement with Supabase Edge Functions
  return { success: true, message: 'Message sent successfully!' };
};

const contactReasons = [
  { value: 'pricing', label: 'Pricing Inquiry' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'partnership', label: 'Partnership Inquiry' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'other', label: 'Other' }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.reason || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await sendContactEmail(formData);
      
      if (response.status === 200) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', reason: '', message: '' });
        toast.success('Message sent successfully! Check your email for confirmation.');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      toast.error('Failed to send message. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MarketingLayout>
      <div className="py-20 md:py-24 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Get In Touch
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Have questions about Editable? Need help with your video review workflow? 
              We're here to help you get back to editing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-semibold text-white mb-6">Let's Talk</h2>
                <p className="text-gray-300 leading-relaxed mb-8">
                  Whether you're a solo editor or managing a team, we're here to help you streamline your client review process.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Email</h3>
                    <p className="text-gray-400">youreditable@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Response Time</h3>
                    <p className="text-gray-400">Within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Based in</h3>
                    <p className="text-gray-400">Israel, serving globally</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Built by editors, for editors. We understand your workflow because we live it too.
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {submitStatus === 'success' && (
                    <Alert className="bg-green-900/20 border-green-500/30">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <AlertDescription className="text-green-300">
                        Message sent successfully! We've sent you a confirmation email and will respond within 24 hours.
                      </AlertDescription>
                    </Alert>
                  )}

                  {submitStatus === 'error' && (
                    <Alert className="bg-red-900/20 border-red-500/30">
                      <AlertDescription className="text-red-300">
                        Failed to send message. Please try again or email us directly at youreditable@gmail.com
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Your full name"
                          className="bg-[rgb(var(--surface-dark))] border-[rgb(var(--border-dark))] text-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your@email.com"
                          className="bg-[rgb(var(--surface-dark))] border-[rgb(var(--border-dark))] text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason" className="text-white">Reason for Contact *</Label>
                      <Select 
                        value={formData.reason} 
                        onValueChange={(value) => handleInputChange('reason', value)}
                        required
                      >
                        <SelectTrigger className="bg-[rgb(var(--surface-dark))] border-[rgb(var(--border-dark))] text-white">
                          <SelectValue placeholder="Select a reason for contacting us" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactReasons.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-white">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Tell us how we can help you..."
                        rows={6}
                        className="bg-[rgb(var(--surface-dark))] border-[rgb(var(--border-dark))] text-white resize-none"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white accent-glow h-12 text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="pt-4 border-t border-[rgb(var(--border-dark))] text-center">
                    <p className="text-sm text-gray-400">
                      We'll send you a confirmation email once we receive your message.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}