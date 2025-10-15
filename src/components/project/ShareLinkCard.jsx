import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Share2, 
    Copy, 
    Calendar, 
    ExternalLink,
    RefreshCw,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { format, isAfter, differenceInDays } from 'date-fns';

export default function ShareLinkCard({ project, onExtendLink, onGenerateNewLink }) {
    const [isCopying, setCopying] = useState(false);
    const [isExtending, setIsExtending] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [expiryDate, setExpiryDate] = useState(null);

    // Update expiry date when project changes
    useEffect(() => {
        if (project?.share_expires_at) {
            setExpiryDate(new Date(project.share_expires_at));
        } else {
            setExpiryDate(null);
        }
    }, [project?.share_expires_at]);

    const shareUrl = `${window.location.origin}/Review?token=${project.share_token}`;
    const isExpired = expiryDate && !isAfter(expiryDate, new Date());
    const daysUntilExpiry = expiryDate ? differenceInDays(expiryDate, new Date()) : null;

    const handleCopyLink = async () => {
        setCopying(true);
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Review link copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy link');
        } finally {
            setCopying(false);
        }
    };

    const handleExtendLink = async () => {
        setIsExtending(true);
        try {
            await onExtendLink();
            
            // Update local expiry date immediately for better UX
            const newExpiryDate = new Date();
            newExpiryDate.setDate(newExpiryDate.getDate() + 7);
            setExpiryDate(newExpiryDate);
            
            toast.success('Link extended successfully!');
        } catch (error) {
            console.error('Failed to extend link:', error);
            toast.error('Failed to extend link');
        } finally {
            setIsExtending(false);
        }
    };

    const handleGenerateNewLink = async () => {
        setIsGenerating(true);
        try {
            await onGenerateNewLink();
            
            // Update local expiry date immediately for better UX
            const newExpiryDate = new Date();
            newExpiryDate.setDate(newExpiryDate.getDate() + 7);
            setExpiryDate(newExpiryDate);
            
            toast.success('New review link generated!');
        } catch (error) {
            console.error('Failed to generate new link:', error);
            toast.error('Failed to generate new link');
        } finally {
            setIsGenerating(false);
        }
    };

    const getExpiryStatus = () => {
        if (!expiryDate) return { color: 'text-gray-400', text: 'No expiry set' };
        if (isExpired) return { color: 'text-red-400', text: 'Expired' };
        if (daysUntilExpiry <= 1) return { color: 'text-red-400', text: `Expires in ${daysUntilExpiry === 0 ? 'less than' : ''} 1 day` };
        if (daysUntilExpiry <= 3) return { color: 'text-amber-400', text: `Expires in ${daysUntilExpiry} days` };
        return { color: 'text-green-400', text: `Expires in ${daysUntilExpiry} days` };
    };

    const expiryStatus = getExpiryStatus();

    return (
        <Card className="bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))]">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-[rgb(var(--accent-primary))]" />
                    Client Review Link
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Link Display and Copy */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-[rgb(var(--surface-dark))] rounded-lg border border-[rgb(var(--border-dark))]">
                        <Input
                            value={shareUrl}
                            readOnly
                            className="flex-1 bg-transparent border-none text-[rgb(var(--text-secondary))] text-sm focus:ring-0"
                        />
                        <Button
                            onClick={handleCopyLink}
                            disabled={isCopying}
                            size="sm"
                            className="bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white"
                        >
                            {isCopying ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[rgb(var(--text-secondary))]" />
                            <span className={`text-sm font-medium ${expiryStatus.color}`}>
                                {expiryStatus.text}
                            </span>
                        </div>
                        {expiryDate && (
                            <span className="text-xs text-[rgb(var(--text-secondary))]">
                                {format(expiryDate, 'MMM dd, yyyy \'at\' h:mm a')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={handleExtendLink}
                        disabled={isExtending}
                        variant="outline"
                        className="w-full bg-[rgb(var(--surface-dark))] hover:bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))] text-white"
                    >
                        {isExtending ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Extending...
                            </>
                        ) : (
                            <>
                                <Clock className="w-4 h-4 mr-2" />
                                Extend Link (+7 days)
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={handleGenerateNewLink}
                        disabled={isGenerating}
                        variant="outline"
                        className="w-full bg-[rgb(var(--surface-dark))] hover:bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))] text-white"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Generate New Link
                            </>
                        )}
                    </Button>
                </div>

                {/* Open Link Button */}
                <Button
                    onClick={() => window.open(shareUrl, '_blank')}
                    className="w-full bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white"
                >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Review Page
                </Button>

                {/* Warning for expired/expiring links */}
                {(isExpired || (daysUntilExpiry !== null && daysUntilExpiry <= 3)) && (
                    <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="text-red-300 font-medium">
                                {isExpired ? 'Link Expired' : 'Link Expiring Soon'}
                            </p>
                            <p className="text-red-400 mt-1">
                                {isExpired 
                                    ? 'Clients can no longer access this review link. Generate a new one or extend it.'
                                    : 'Consider extending the link or generating a new one before it expires.'
                                }
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}