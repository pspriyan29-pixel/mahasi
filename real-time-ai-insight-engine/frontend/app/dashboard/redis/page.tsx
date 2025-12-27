'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Database, Play, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RedisTestPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);
    const [customKey, setCustomKey] = useState('');
    const [customValue, setCustomValue] = useState('');
    const [customTTL, setCustomTTL] = useState('60');

    const testConnection = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/redis/test');
            const data = await response.json();

            setTestResult(data);

            if (data.success) {
                toast.success('Redis connection successful!');
            } else {
                toast.error('Redis connection failed');
            }
        } catch (error) {
            toast.error('Failed to test Redis connection');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetValue = async () => {
        if (!customKey || !customValue) {
            toast.error('Please enter both key and value');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/redis/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: customKey,
                    value: customValue,
                    ttl: parseInt(customTTL) || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Value set successfully: ${customKey} = ${customValue}`);
                setCustomKey('');
                setCustomValue('');
            } else {
                toast.error('Failed to set value');
            }
        } catch (error) {
            toast.error('Failed to set value in Redis');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text mb-2">Redis Cache Service</h1>
                <p className="text-muted-foreground">
                    Test and manage Redis cache connections
                </p>
            </div>

            {/* Connection Test */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Connection Test
                            </CardTitle>
                            <CardDescription>
                                Test connection to Redis Labs cloud instance
                            </CardDescription>
                        </div>
                        <Button onClick={testConnection} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Test Connection
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                {testResult && (
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                {testResult.success ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <span className="font-medium text-green-500">Connected</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-5 w-5 text-red-500" />
                                        <span className="font-medium text-red-500">Connection Failed</span>
                                    </>
                                )}
                            </div>

                            {testResult.test && (
                                <div className="p-4 rounded-lg bg-muted">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Test Key:</span>
                                            <code className="font-mono">{testResult.test.key}</code>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Value:</span>
                                            <code className="font-mono">{testResult.test.value}</code>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Match:</span>
                                            <Badge variant={testResult.test.match ? 'default' : 'destructive'}>
                                                {testResult.test.match ? 'Success' : 'Failed'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {testResult.error && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm text-red-500">{testResult.message}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Custom Value */}
            <Card>
                <CardHeader>
                    <CardTitle>Set Custom Value</CardTitle>
                    <CardDescription>
                        Store a custom key-value pair in Redis
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="key">Key</Label>
                            <Input
                                id="key"
                                placeholder="my_key"
                                value={customKey}
                                onChange={(e) => setCustomKey(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="value">Value</Label>
                            <Input
                                id="value"
                                placeholder="my_value"
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ttl">TTL (seconds)</Label>
                        <Input
                            id="ttl"
                            type="number"
                            placeholder="60"
                            value={customTTL}
                            onChange={(e) => setCustomTTL(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleSetValue} disabled={isLoading} className="w-full">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Setting...
                            </>
                        ) : (
                            'Set Value'
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Connection Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Connection Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Host:</span>
                            <code className="font-mono">redis-15983.c100.us-east-1-4.ec2.cloud.redislabs.com</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Port:</span>
                            <code className="font-mono">15983</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Username:</span>
                            <code className="font-mono">default</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={testResult?.status?.connected ? 'default' : 'secondary'}>
                                {testResult?.status?.connected ? 'Connected' : 'Not Connected'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
