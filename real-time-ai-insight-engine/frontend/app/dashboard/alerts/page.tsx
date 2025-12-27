'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, CheckCircle, Clock, MoreVertical, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Database } from '@/types/supabase'

type AlertUpdate = Database['public']['Tables']['alerts']['Update']

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()

        async function fetchAlerts() {
            const { data, error: _error } = await supabase
                .from('alerts')
                .select('*, ai_insights(*)')
                .order('created_at', { ascending: false })
                .limit(50)

            if (data) {
                setAlerts(data)
            }
            if (_error) {
                // Error handling can be added here if needed
            }
            setLoading(false)
        }

        fetchAlerts()

        // Subscribe to new alerts
        const channel = supabase
            .channel('alerts-page')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'alerts',
                },
                (payload) => {
                    setAlerts((prev) => [payload.new, ...prev])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            open: 'destructive',
            acknowledged: 'warning',
            resolved: 'success',
            ignored: 'secondary',
        }
        return variants[status] || 'default'
    }

    const getSeverityBadge = (severity: string) => {
        const variants: Record<string, any> = {
            CRITICAL: 'destructive',
            HIGH: 'destructive',
            MEDIUM: 'warning',
            LOW: 'default',
        }
        return variants[severity] || 'default'
    }

    const handleAcknowledge = async (alertId: string) => {
        const supabase = createClient()
        const updateData: AlertUpdate = {
            status: 'acknowledged',
            acknowledged_at: new Date().toISOString(),
        }
        await (supabase
            .from('alerts') as any)
            .update(updateData)
            .eq('id', alertId)

        setAlerts((prev) =>
            prev.map((alert) =>
                alert.id === alertId
                    ? { ...alert, status: 'acknowledged' }
                    : alert
            )
        )
    }

    const handleResolve = async (alertId: string) => {
        const supabase = createClient()
        const updateData: AlertUpdate = {
            status: 'resolved',
            resolved_at: new Date().toISOString(),
        }
        await (supabase
            .from('alerts') as any)
            .update(updateData)
            .eq('id', alertId)

        setAlerts((prev) =>
            prev.map((alert) =>
                alert.id === alertId ? { ...alert, status: 'resolved' } : alert
            )
        )
    }

    const stats = {
        total: alerts.length,
        open: alerts.filter((a) => a.status === 'open').length,
        acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
        resolved: alerts.filter((a) => a.status === 'resolved').length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        Alert Management
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor and manage system alerts
                    </p>
                </div>
                <Button className="gap-2">
                    <Bell className="w-4 h-4" />
                    Create Alert Rule
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-sm text-muted-foreground">Total Alerts</p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-500">{stats.open}</div>
                        <p className="text-sm text-muted-foreground">Open</p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-500">
                            {stats.acknowledged}
                        </div>
                        <p className="text-sm text-muted-foreground">Acknowledged</p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-500">
                            {stats.resolved}
                        </div>
                        <p className="text-sm text-muted-foreground">Resolved</p>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts Table */}
            <Card className="glass">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Recent Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Loading alerts...
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No alerts</p>
                            <p className="text-sm mt-1">All systems operating normally</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {alerts.map((alert) => (
                                    <TableRow key={alert.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{alert.title}</p>
                                                {alert.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {alert.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getSeverityBadge(alert.severity)}>
                                                {alert.severity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadge(alert.status)}>
                                                {alert.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(alert.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {alert.status === 'open' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleAcknowledge(alert.id)}
                                                        >
                                                            Acknowledge
                                                        </DropdownMenuItem>
                                                    )}
                                                    {alert.status !== 'resolved' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleResolve(alert.id)}
                                                        >
                                                            Resolve
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
