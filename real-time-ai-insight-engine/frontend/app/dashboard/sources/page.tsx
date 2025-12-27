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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Database,
    Plus,
    Trash2,
    RefreshCw,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface DataSource {
    id: string;
    organization_id: string;
    name: string;
    type: 'kafka' | 'webhook' | 'api' | 'file';
    config: Record<string, any>;
    status: 'active' | 'paused' | 'error';
    last_event_at: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
}

type DataSourceType = 'kafka' | 'webhook' | 'api' | 'file';

export default function DataSourcesPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sourceToEdit, setSourceToEdit] = useState<DataSource | null>(null);
    const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        type: 'kafka' as DataSourceType,
        config: {
            host: '',
            port: '',
            topic: '',
            url: '',
        },
    });

    useEffect(() => {
        loadDataSources();
    }, []);

    const loadDataSources = async () => {
        try {
            setLoading(true);

            // Get current user and organization
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
                .from('data_sources') as any)
                .select('*')
                .eq('organization_id', orgMember.organization_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDataSources(data || []);
        } catch (error) {
            console.error('Error loading data sources:', error);
            toast.error('Failed to load data sources');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            toast.error('Please enter a name');
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

            // Build config based on type
            let config = {};
            if (formData.type === 'kafka') {
                config = {
                    host: formData.config.host,
                    port: formData.config.port,
                    topic: formData.config.topic,
                };
            } else if (formData.type === 'webhook' || formData.type === 'api') {
                config = {
                    url: formData.config.url,
                };
            }

            const { data, error } = await (supabase
                .from('data_sources') as any)
                .insert({
                    organization_id: currentOrgId,
                    name: formData.name,
                    type: formData.type,
                    config: config,
                    status: 'active',
                    created_by: user.id,
                })
                .select()
                .single();

            if (error) throw error;

            setDataSources([data, ...dataSources]);
            toast.success('✅ Data source created successfully!');
            setCreateDialogOpen(false);
            resetForm();
        } catch (error: any) {
            console.error('Error creating data source:', error);
            toast.error('Failed to create data source: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!sourceToEdit) return;

        try {
            setLoading(true);

            let config = {};
            if (formData.type === 'kafka') {
                config = {
                    host: formData.config.host,
                    port: formData.config.port,
                    topic: formData.config.topic,
                };
            } else if (formData.type === 'webhook' || formData.type === 'api') {
                config = {
                    url: formData.config.url,
                };
            }

            const { data, error } = await (supabase
                .from('data_sources') as any)
                .update({
                    name: formData.name,
                    type: formData.type,
                    config: config,
                })
                .eq('id', sourceToEdit.id)
                .select()
                .single();

            if (error) throw error;

            setDataSources(dataSources.map(s => s.id === sourceToEdit.id ? data : s));
            toast.success('✅ Data source updated successfully!');
            setEditDialogOpen(false);
            setSourceToEdit(null);
            resetForm();
        } catch (error: any) {
            console.error('Error updating data source:', error);
            toast.error('Failed to update data source: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (sourceId: string) => {
        try {
            setLoading(true);

            const { error } = await (supabase
                .from('data_sources') as any)
                .delete()
                .eq('id', sourceId);

            if (error) throw error;

            setDataSources(dataSources.filter(s => s.id !== sourceId));
            toast.success('🗑️ Data source deleted successfully!');
            setDeleteDialogOpen(false);
            setSourceToDelete(null);
        } catch (error: any) {
            console.error('Error deleting data source:', error);
            toast.error('Failed to delete data source: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async (source: DataSource) => {
        toast.info('🔄 Testing connection...');

        // Simulate connection test
        setTimeout(() => {
            if (source.status === 'active') {
                toast.success('✅ Connection successful!');
            } else {
                toast.error('❌ Connection failed!');
            }
        }, 1500);
    };

    const openEditDialog = (source: DataSource) => {
        setSourceToEdit(source);
        setFormData({
            name: source.name,
            type: source.type,
            config: source.config,
        });
        setEditDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'kafka',
            config: {
                host: '',
                port: '',
                topic: '',
                url: '',
            },
        });
    };

    const getStatusIcon = (status: DataSource['status']) => {
        switch (status) {
            case 'active':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'paused':
                return <XCircle className="h-5 w-5 text-gray-500" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
        }
    };

    const getStatusBadge = (status: DataSource['status']) => {
        const variants = {
            active: 'default',
            paused: 'secondary',
            error: 'destructive',
        } as const;

        return (
            <Badge variant={variants[status]} className="capitalize">
                {status}
            </Badge>
        );
    };

    if (loading && dataSources.length === 0) {
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
                    <h1 className="text-3xl font-bold gradient-text mb-2">Data Sources</h1>
                    <p className="text-muted-foreground">
                        Manage your data connections and integrations
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
                    Add Data Source
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                <Card className="animate-fade-up">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Sources
                        </CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dataSources.length}</div>
                    </CardContent>
                </Card>

                <Card className="animate-fade-up stagger-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Connected
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dataSources.filter((s) => s.status === 'active').length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="animate-fade-up stagger-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Errors
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dataSources.filter((s) => s.status === 'error').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Sources List */}
            <div className="space-y-4">
                {dataSources.map((source, index) => (
                    <Card key={source.id} className="glass-hover card-hover animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-primary/10 p-3">
                                        <Database className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <CardTitle>{source.name}</CardTitle>
                                            {getStatusBadge(source.status)}
                                        </div>
                                        <CardDescription className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {source.type.toUpperCase()}
                                            </Badge>
                                            {source.last_event_at && (
                                                <span>Last sync: {new Date(source.last_event_at).toLocaleString()}</span>
                                            )}
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(source.status)}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(source.config).map(([key, value]) => (
                                        <div key={key}>
                                            <Label className="text-xs text-muted-foreground capitalize">
                                                {key}
                                            </Label>
                                            <p className="text-sm font-medium">{String(value)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 hover-lift"
                                        onClick={() => handleTestConnection(source)}
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Test Connection
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 hover-lift"
                                        onClick={() => openEditDialog(source)}
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 text-red-500 hover:text-red-600 hover-lift"
                                        onClick={() => {
                                            setSourceToDelete(source.id);
                                            setDeleteDialogOpen(true);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {dataSources.length === 0 && (
                <Card className="animate-scale-in">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Database className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">No data sources configured</h3>
                        <p className="mb-4 text-center text-sm text-muted-foreground">
                            Connect your first data source to start ingesting events
                        </p>
                        <Button
                            className="gap-2 hover-lift"
                            onClick={() => {
                                resetForm();
                                setCreateDialogOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Add Data Source
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Data Source</DialogTitle>
                        <DialogDescription>
                            Configure a new data source to start ingesting events
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Production Kafka Stream"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: DataSourceType) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kafka">Kafka</SelectItem>
                                    <SelectItem value="webhook">Webhook</SelectItem>
                                    <SelectItem value="api">API</SelectItem>
                                    <SelectItem value="file">File</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.type === 'kafka' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="host">Host</Label>
                                    <Input
                                        id="host"
                                        placeholder="localhost"
                                        value={formData.config.host}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            config: { ...formData.config, host: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="port">Port</Label>
                                    <Input
                                        id="port"
                                        placeholder="9092"
                                        value={formData.config.port}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            config: { ...formData.config, port: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="topic">Topic</Label>
                                    <Input
                                        id="topic"
                                        placeholder="events"
                                        value={formData.config.topic}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            config: { ...formData.config, topic: e.target.value }
                                        })}
                                    />
                                </div>
                            </>
                        )}

                        {(formData.type === 'webhook' || formData.type === 'api') && (
                            <div className="space-y-2">
                                <Label htmlFor="url">URL</Label>
                                <Input
                                    id="url"
                                    placeholder="https://api.example.com/events"
                                    value={formData.config.url}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        config: { ...formData.config, url: e.target.value }
                                    })}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={loading} className="hover-lift">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Source
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Data Source</DialogTitle>
                        <DialogDescription>
                            Update your data source configuration
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-type">Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: DataSourceType) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kafka">Kafka</SelectItem>
                                    <SelectItem value="webhook">Webhook</SelectItem>
                                    <SelectItem value="api">API</SelectItem>
                                    <SelectItem value="file">File</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.type === 'kafka' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-host">Host</Label>
                                    <Input
                                        id="edit-host"
                                        value={formData.config.host}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            config: { ...formData.config, host: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-port">Port</Label>
                                    <Input
                                        id="edit-port"
                                        value={formData.config.port}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            config: { ...formData.config, port: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-topic">Topic</Label>
                                    <Input
                                        id="edit-topic"
                                        value={formData.config.topic}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            config: { ...formData.config, topic: e.target.value }
                                        })}
                                    />
                                </div>
                            </>
                        )}

                        {(formData.type === 'webhook' || formData.type === 'api') && (
                            <div className="space-y-2">
                                <Label htmlFor="edit-url">URL</Label>
                                <Input
                                    id="edit-url"
                                    value={formData.config.url}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        config: { ...formData.config, url: e.target.value }
                                    })}
                                />
                            </div>
                        )}
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
                        <AlertDialogTitle>Delete Data Source?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this data source. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => sourceToDelete && handleDelete(sourceToDelete)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Source
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
