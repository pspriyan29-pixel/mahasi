'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Key, Plus, Trash2, Copy, Eye, EyeOff, RefreshCw, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface APIKey {
    id: string;
    organization_id: string;
    name: string;
    key_hash: string;
    prefix: string;
    permissions: Record<string, any>;
    created_at: string;
    last_used_at: string | null;
    expires_at: string | null;
    created_by: string;
    // Client-side only fields
    key?: string; // Only available right after creation
}

export default function APIKeysPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
    const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
    const [keyToRegenerate, setKeyToRegenerate] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked'>('all');
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

    // Filtered API keys based on search and filter
    const filteredApiKeys = apiKeys.filter(key => {
        const matchesSearch = key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            key.prefix.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && (!key.expires_at || new Date(key.expires_at) > new Date())) ||
            (filterStatus === 'revoked' && key.expires_at && new Date(key.expires_at) <= new Date());
        return matchesSearch && matchesStatus;
    });

    // Load API keys on mount
    useEffect(() => {
        loadAPIKeys();
    }, []);

    const loadAPIKeys = async () => {
        try {
            setLoading(true);

            // Get current user and their organization
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('You must be logged in');
                return;
            }

            // Get user's organization
            const { data: orgMember } = await supabase
                .from('organization_members')
                .select('organization_id')
                .eq('user_id', user.id)
                .single();

            if (!orgMember) {
                toast.error('No organization found');
                return;
            }

            setCurrentOrgId((orgMember as any).organization_id);

            const { data, error } = await supabase
                .from('api_keys')
                .select('*')
                .eq('organization_id', (orgMember as any).organization_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApiKeys(data || []);
        } catch (error) {
            console.error('Error loading API keys:', error);
            toast.error('Failed to load API keys');
        } finally {
            setLoading(false);
        }
    };

    const generateRandomKey = () => {
        const prefix = 'sk_live';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let secret = '';
        for (let i = 0; i < 32; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return { prefix, key: `${prefix}_${secret}`, secret };
    };

    const hashKey = async (key: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(key);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleCreateKey = async () => {
        if (!newKeyName.trim()) {
            toast.error('Please enter a key name');
            return;
        }

        if (!currentOrgId) {
            toast.error('No organization found');
            return;
        }

        const { prefix, key, secret } = generateRandomKey();

        try {
            setLoading(true);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('You must be logged in to create API keys');
                return;
            }

            // Hash the key
            const keyHash = await hashKey(key);

            const { data, error } = await (supabase
                .from('api_keys') as any)
                .insert({
                    organization_id: currentOrgId,
                    name: newKeyName,
                    key_hash: keyHash,
                    prefix: prefix,
                    permissions: { 'read:events': true, 'write:events': true },
                    created_by: user.id,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating API key:', error);
                toast.error('Failed to create API key: ' + error.message);
                return;
            }

            if (!data) {
                toast.error('Failed to create API key: No data returned');
                return;
            }

            // Add to local state with the full key (only available now)
            const newKey = { ...(data as any), key } as APIKey;
            setApiKeys([newKey, ...apiKeys]);

            toast.success('✅ API key created successfully!', {
                description: 'Your new API key is ready to use',
            });

            setCreateDialogOpen(false);
            setNewKeyName('');

            // Auto-show the new key
            setVisibleKeys(prev => new Set([...prev, (data as any).id]));

            // Show key copied notification
            setTimeout(() => {
                toast.info('💡 Tip: Copy your API key now - it won\'t be shown again!', {
                    duration: 5000,
                });
            }, 500);
        } catch (error: any) {
            console.error('Error creating API key:', error);
            toast.error('Failed to create API key: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateKey = async (keyId: string) => {
        const { prefix, key, secret } = generateRandomKey();

        try {
            setLoading(true);

            // Hash the new key
            const keyHash = await hashKey(key);

            const { data, error } = await (supabase
                .from('api_keys') as any)
                .update({
                    key_hash: keyHash,
                    prefix: prefix,
                    last_used_at: null
                })
                .eq('id', keyId)
                .select()
                .single();

            if (error) {
                console.error('Error regenerating API key:', error);
                toast.error('Failed to regenerate API key: ' + error.message);
                return;
            }

            if (!data) {
                toast.error('Failed to regenerate API key: No data returned');
                return;
            }

            // Update local state with the new key (only available now)
            const updatedKeys = apiKeys.map(k =>
                k.id === keyId ? { ...(data as any), key, last_used_at: null } as APIKey : k
            );
            setApiKeys(updatedKeys);

            toast.success('🔄 API key regenerated successfully!', {
                description: 'Your API key has been updated',
            });

            setRegenerateDialogOpen(false);
            setKeyToRegenerate(null);

            // Auto-show the regenerated key
            setVisibleKeys(prev => new Set([...prev, keyId]));

            // Remind user to copy
            setTimeout(() => {
                toast.info('💡 Remember to update your applications with the new key!', {
                    duration: 5000,
                });
            }, 500);
        } catch (error: any) {
            console.error('Error regenerating API key:', error);
            toast.error('Failed to regenerate API key: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteKey = async (keyId: string) => {
        try {
            setLoading(true);

            const { error } = await supabase
                .from('api_keys')
                .delete()
                .eq('id', keyId);

            if (error) {
                console.error('Error deleting API key:', error);
                toast.error('Failed to delete API key: ' + error.message);
                return;
            }

            // Update local state
            const updatedKeys = apiKeys.filter(k => k.id !== keyId);
            setApiKeys(updatedKeys);

            toast.success('🗑️ API key deleted successfully!', {
                description: 'The API key has been permanently removed',
            });

            setDeleteDialogOpen(false);
            setKeyToDelete(null);

            // Remove from visible keys
            setVisibleKeys(prev => {
                const newSet = new Set(prev);
                newSet.delete(keyId);
                return newSet;
            });
        } catch (error: any) {
            console.error('Error deleting API key:', error);
            toast.error('Failed to delete API key: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const toggleKeyVisibility = (id: string) => {
        setVisibleKeys((prev) => {
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
        toast.success('API key copied to clipboard!');
    };

    const maskKey = (key: string) => {
        if (key.length <= 12) return key;
        return key.substring(0, 8) + '•'.repeat(Math.min(20, key.length - 8));
    };

    if (loading) {
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
                    <h1 className="text-3xl font-bold gradient-text mb-2">API Keys</h1>
                    <p className="text-muted-foreground">
                        Manage API keys for programmatic access to your data
                    </p>
                </div>
                <Button
                    className="gap-2 hover-lift button-press"
                    onClick={() => setCreateDialogOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Generate New Key
                </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="w-full sm:w-96">
                    <Input
                        placeholder="Search API keys by name or key..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white/5"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filterStatus === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('all')}
                        className="touch-manipulation"
                    >
                        All ({apiKeys.length})
                    </Button>
                    <Button
                        variant={filterStatus === 'active' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('active')}
                        className="touch-manipulation"
                    >
                        Active ({apiKeys.filter(k => !k.expires_at || new Date(k.expires_at) > new Date()).length})
                    </Button>
                    <Button
                        variant={filterStatus === 'revoked' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('revoked')}
                        className="touch-manipulation"
                    >
                        Expired ({apiKeys.filter(k => k.expires_at && new Date(k.expires_at) <= new Date()).length})
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                <Card className="animate-fade-up">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Keys
                        </CardTitle>
                        <Key className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{apiKeys.length}</div>
                    </CardContent>
                </Card>

                <Card className="animate-fade-up stagger-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Keys
                        </CardTitle>
                        <Key className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {apiKeys.filter((k) => !k.expires_at || new Date(k.expires_at) > new Date()).length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="animate-fade-up stagger-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Expired Keys
                        </CardTitle>
                        <Key className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {apiKeys.filter((k) => k.expires_at && new Date(k.expires_at) <= new Date()).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* API Keys List */}
            <div className="space-y-4">
                {filteredApiKeys.length > 0 && filteredApiKeys.map((apiKey, index) => (
                    <Card
                        key={apiKey.id}
                        className="glass-hover card-hover animate-fade-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-primary/10 p-3">
                                        <Key className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <CardTitle>{apiKey.name}</CardTitle>
                                            <Badge
                                                variant={
                                                    !apiKey.expires_at || new Date(apiKey.expires_at) > new Date() ? 'default' : 'destructive'
                                                }
                                            >
                                                {!apiKey.expires_at || new Date(apiKey.expires_at) > new Date() ? 'active' : 'expired'}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            Created: {new Date(apiKey.created_at).toLocaleDateString()}
                                            {apiKey.last_used_at && ` • Last used: ${new Date(apiKey.last_used_at).toLocaleDateString()}`}
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* API Key */}
                            <div>
                                <Label className="text-xs text-muted-foreground">API Key</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        value={
                                            visibleKeys.has(apiKey.id) && apiKey.key
                                                ? apiKey.key
                                                : `${apiKey.prefix}_${'•'.repeat(32)}`
                                        }
                                        readOnly
                                        className="font-mono text-sm bg-white/5"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleKeyVisibility(apiKey.id)}
                                        className="hover-scale"
                                    >
                                        {visibleKeys.has(apiKey.id) ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => apiKey.key && copyToClipboard(apiKey.key)}
                                        className="hover-scale"
                                        disabled={!apiKey.key}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Permissions */}
                            {apiKey.permissions && Object.keys(apiKey.permissions).length > 0 && (
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-2 block">
                                        Permissions
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(apiKey.permissions).map(([permission, enabled]) => (
                                            enabled && (
                                                <Badge key={permission} variant="outline">
                                                    {permission}
                                                </Badge>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 hover-lift"
                                    onClick={() => {
                                        setKeyToRegenerate(apiKey.id);
                                        setRegenerateDialogOpen(true);
                                    }}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Regenerate
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-red-500 hover:text-red-600 hover-lift"
                                    onClick={() => {
                                        setKeyToDelete(apiKey.id);
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

            {/* Empty State - No Results from Filter */}
            {apiKeys.length > 0 && filteredApiKeys.length === 0 && (
                <Card className="animate-scale-in">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Key className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="mb-2 text-lg font-semibold">No API keys found</h3>
                        <p className="mb-4 text-center text-sm text-muted-foreground max-w-md">
                            No API keys match your search criteria. Try adjusting your filters or search query.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery('');
                                setFilterStatus('all');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Empty State - No Keys at All */}
            {apiKeys.length === 0 && (
                <Card className="animate-scale-in">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Key className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">No API keys generated</h3>
                        <p className="mb-4 text-center text-sm text-muted-foreground">
                            Generate your first API key to access the API programmatically
                        </p>
                        <Button
                            className="gap-2 hover-lift"
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Generate New Key
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Security Notice */}
            <Card className="border-yellow-500/50 bg-yellow-500/10 animate-fade-in">
                <CardHeader>
                    <CardTitle className="text-sm">Security Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>• Never share your API keys publicly or commit them to version control</p>
                    <p>• Rotate your keys regularly for enhanced security</p>
                    <p>• Use different keys for different environments (production, staging, development)</p>
                    <p>• Revoke keys immediately if you suspect they have been compromised</p>
                </CardContent>
            </Card>

            {/* Create Key Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate New API Key</DialogTitle>
                        <DialogDescription>
                            Create a new API key for programmatic access to your data.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="keyName">Key Name</Label>
                            <Input
                                id="keyName"
                                placeholder="e.g., Production API Key"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreateKey();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateKey} className="hover-lift">
                            Generate Key
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Regenerate Confirmation Dialog */}
            <AlertDialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate API Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will generate a new key and invalidate the old one. Any applications using the old key will stop working.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => keyToRegenerate && handleRegenerateKey(keyToRegenerate)}
                            className="bg-yellow-600 hover:bg-yellow-700"
                        >
                            Regenerate Key
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this API key. Any applications using this key will stop working.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => keyToDelete && handleDeleteKey(keyToDelete)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Key
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
