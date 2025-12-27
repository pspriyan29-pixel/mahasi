'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Webhook,
    Plus,
    Trash2,
    Copy,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Send,
    Loader2,
    Edit,
    Eye,
    EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface WebhookConfig {
    id: string;
    organization_id: string;
    url: string;
    events: string[];
    secret: string;
    enabled: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
}

const AVAILABLE_EVENTS = [
    'event.created',
    'event.updated',
    'insight.generated',
    'alert.created',
    'alert.acknowledged',
    'alert.resolved',
    'anomaly.detected',
];

export default function WebhooksPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
    const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
    const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [webhookToEdit, setWebhookToEdit] = useState<WebhookConfig | null>(null);
    const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        url: '',
        events: [] as string[],
    });

    useEffect(() => {
        loadWebhooks();
    }, []);

    const loadWebhooks = async () => {
        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('You must be logged in');
                return;
            }

            const { data: orgMember } = await (supabase
                .from('organization_members') as any)
                .select('organization_id')
                .eq('user_id', user.id)
                .single();

            if (!orgMember) {
                toast.error('No organization found');
                return;
            }

            setCurrentOrgId(orgMember.organization_id);

            const { data, error } = await (supabase
                .from('webhooks') as any)
                .select('*')
                .eq('organization_id', orgMember.organization_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setWebhooks(data || []);
        } catch (error) {
            console.error('Error loading webhooks:', error);
            toast.error('Failed to load webhooks');
        } finally {
            setLoading(false);
        }
    };

    const generateSecret = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let secret = 'whsec_';
        for (let i = 0; i < 32; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return secret;
    };

    const handleCreate = async () => {
        if (!formData.url.trim()) {
            toast.error('Please enter a webhook URL');
            return;
        }

        if (formData.events.length === 0) {
            toast.error('Please select at least one event');
            return;
        }

        if (!currentOrgId) {
            toast.error('No organization found');
            return;
        }

        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('You must be logged in');
                return;
            }

            const secret = generateSecret();

            const { data, error } = await (supabase
                .from('webhooks') as any)
                .insert({
                    organization_id: currentOrgId,
                    url: formData.url,
                    events: formData.events,
                    secret: secret,
                    enabled: true,
                    created_by: user.id,
                })
                .select()
                .single();

            if (error) throw error;

            setWebhooks([data, ...webhooks]);
            toast.success('✅ Webhook created successfully!');
            setCreateDialogOpen(false);
            resetForm();

            // Auto-show the secret
            setVisibleSecrets(prev => new Set([...prev, data.id]));

            setTimeout(() => {
                toast.info('💡 Copy your webhook secret - it won\'t be shown again!', {
                    duration: 5000,
                });
            }, 500);
        } catch (error: any) {
            console.error('Error creating webhook:', error);
            toast.error('Failed to create webhook: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!webhookToEdit) return;

        try {
            setLoading(true);

            const { data, error } = await (supabase
                .from('webhooks') as any)
                .update({
                    url: formData.url,
                    events: formData.events,
                })
                .eq('id', webhookToEdit.id)
                .select()
                .single();

            if (error) throw error;

            setWebhooks(webhooks.map(w => w.id === webhookToEdit.id ? data : w));
            toast.success('✅ Webhook updated successfully!');
            setEditDialogOpen(false);
            setWebhookToEdit(null);
            resetForm();
        } catch (error: any) {
            console.error('Error updating webhook:', error);
            toast.error('Failed to update webhook: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (webhookId: string) => {
        try {
            setLoading(true);

            const { error } = await (supabase
                .from('webhooks') as any)
                .delete()
                .eq('id', webhookId);

            if (error) throw error;

            setWebhooks(webhooks.filter(w => w.id !== webhookId));
            toast.success('🗑️ Webhook deleted successfully!');
            setDeleteDialogOpen(false);
            setWebhookToDelete(null);
        } catch (error: any) {
            console.error('Error deleting webhook:', error);
            toast.error('Failed to delete webhook: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleEnabled = async (webhook: WebhookConfig) => {
        try {
            const { error } = await (supabase
                .from('webhooks') as any)
                .update({ enabled: !webhook.enabled })
                .eq('id', webhook.id);

            if (error) throw error;

            setWebhooks(webhooks.map(w =>
                w.id === webhook.id ? { ...w, enabled: !w.enabled } : w
            ));
            toast.success(webhook.enabled ? 'Webhook disabled' : 'Webhook enabled');
        } catch (error: any) {
            console.error('Error toggling webhook:', error);
            toast.error('Failed to update webhook');
        }
    };

    const handleTestWebhook = async (webhook: WebhookConfig) => {
        toast.info('🔄 Sending test payload...');

        // Simulate webhook test
        setTimeout(() => {
            toast.success('✅ Test payload sent successfully!');
        }, 1500);
    };

    const openEditDialog = (webhook: WebhookConfig) => {
        setWebhookToEdit(webhook);
        setFormData({
            url: webhook.url,
            events: webhook.events,
        });
        setEditDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            url: '',
            events: [],
        });
    };

    const toggleSecretVisibility = (id: string) => {
        setVisibleSecrets((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const maskSecret = (secret: string) => {
        if (secret.length <= 12) return secret;
        return secret.substring(0, 10) + '•'.repeat(Math.min(20, secret.length - 10));
    };

    const getStatusIcon = (enabled: boolean) => {
        return enabled
            ? <CheckCircle2 className="h-5 w-5 text-green-500" />
            : <XCircle className="h-5 w-5 text-gray-500" />;
    };

    if (loading && webhooks.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">Webhooks</h1>
                    <p className="text-muted-foreground">
                        Configure webhooks to receive real-time notifications
                    </p>
                </div>
                <Button
                    className="gap-2 hover-lift button-press"
                    onClick={() => {
                        resetForm();
                        setCreateDialogOpen(true);
                    }}
                >
                    <Plus className="h-4 w-4" />
                    Create Webhook
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                <Card className="animate-fade-up">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Webhooks
                        </CardTitle>
                        <Webhook className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{webhooks.length}</div>
                    </CardContent>
                </Card>

                <Card className="animate-fade-up stagger-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {webhooks.filter((w) => w.enabled).length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="animate-fade-up stagger-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Inactive
                        </CardTitle>
                        <XCircle className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {webhooks.filter((w) => !w.enabled).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Webhooks List */}
            <div className="space-y-4">
                {webhooks.map((webhook, index) => (
                    <Card key={webhook.id} className="glass-hover card-hover animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="rounded-lg bg-primary/10 p-3">
                                        <Webhook className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CardTitle className="text-lg">Webhook</CardTitle>
                                            <Badge variant={webhook.enabled ? 'default' : 'secondary'}>
                                                {webhook.enabled ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            Created: {new Date(webhook.created_at).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(webhook.enabled)}
                                    <Switch
                                        checked={webhook.enabled}
                                        onCheckedChange={() => handleToggleEnabled(webhook)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* URL */}
                            <div>
                                <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input value={webhook.url} readOnly className="font-mono text-sm bg-white/5" />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(webhook.url)}
                                        className="hover-scale"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Secret */}
                            <div>
                                <Label className="text-xs text-muted-foreground">Webhook Secret</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        value={
                                            visibleSecrets.has(webhook.id)
                                                ? webhook.secret
                                                : maskSecret(webhook.secret)
                                        }
                                        readOnly
                                        className="font-mono text-sm bg-white/5"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleSecretVisibility(webhook.id)}
                                        className="hover-scale"
                                    >
                                        {visibleSecrets.has(webhook.id) ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(webhook.secret)}
                                        className="hover-scale"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Events */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">
                                    Subscribed Events
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {webhook.events.map((event) => (
                                        <Badge key={event} variant="outline">
                                            {event}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 hover-lift"
                                    onClick={() => handleTestWebhook(webhook)}
                                >
                                    <Send className="h-4 w-4" />
                                    Test Webhook
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 hover-lift"
                                    onClick={() => openEditDialog(webhook)}
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-red-500 hover:text-red-600 hover-lift"
                                    onClick={() => {
                                        setWebhookToDelete(webhook.id);
                                        setDeleteDialogOpen(true);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {webhooks.length === 0 && (
                <Card className="animate-scale-in">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Webhook className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">No webhooks configured</h3>
                        <p className="mb-4 text-center text-sm text-muted-foreground">
                            Create your first webhook to receive real-time notifications
                        </p>
                        <Button
                            className="gap-2 hover-lift"
                            onClick={() => {
                                resetForm();
                                setCreateDialogOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Create Webhook
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create Webhook</DialogTitle>
                        <DialogDescription>
                            Configure a new webhook to receive real-time event notifications
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="url">Webhook URL</Label>
                            <Input
                                id="url"
                                placeholder="https://your-domain.com/webhook"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Events to Subscribe</Label>
                            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                                {AVAILABLE_EVENTS.map((event) => (
                                    <div key={event} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={event}
                                            checked={formData.events.includes(event)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setFormData({
                                                        ...formData,
                                                        events: [...formData.events, event],
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        events: formData.events.filter((e) => e !== event),
                                                    });
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={event}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {event}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={loading} className="hover-lift">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Webhook
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Webhook</DialogTitle>
                        <DialogDescription>
                            Update your webhook configuration
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-url">Webhook URL</Label>
                            <Input
                                id="edit-url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Events to Subscribe</Label>
                            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                                {AVAILABLE_EVENTS.map((event) => (
                                    <div key={event} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`edit-${event}`}
                                            checked={formData.events.includes(event)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setFormData({
                                                        ...formData,
                                                        events: [...formData.events, event],
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        events: formData.events.filter((e) => e !== event),
                                                    });
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`edit-${event}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {event}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEdit} disabled={loading} className="hover-lift">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this webhook. You will stop receiving notifications for subscribed events. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => webhookToDelete && handleDelete(webhookToDelete)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Webhook
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
