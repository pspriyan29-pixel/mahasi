'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Search, Filter, Download, MoreVertical, Activity } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const supabase = createClient()

        async function fetchEvents() {
            const { data, error: _error } = await supabase
                .from('events')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(100)

            if (data) {
                setEvents(data)
            }
            if (_error) {
                // Error handling can be added here if needed
            }
            setLoading(false)
        }

        fetchEvents()

        // Subscribe to new events
        const channel = supabase
            .channel('events-page')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'events',
                },
                (payload) => {
                    setEvents((prev) => [payload.new, ...prev].slice(0, 100))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const filteredEvents = events.filter((event) =>
        event.event_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.event_type?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getEventTypeBadge = (type: string) => {
        const variants: Record<string, 'default' | 'success' | 'warning'> = {
            purchase: 'success',
            refund: 'warning',
            transfer: 'default',
        }
        return variants[type] || 'default'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        Event Explorer
                    </h1>
                    <p className="text-muted-foreground">
                        Real-time transaction events from all data sources
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filters
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Search */}
            <Card className="glass">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events by ID, region, or type..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Events Table */}
            <Card className="glass">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recent Events
                        <Badge variant="secondary" className="ml-2">
                            {filteredEvents.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Loading events...
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No events found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-mono text-sm">
                                            {event.event_id?.slice(0, 12)}...
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getEventTypeBadge(event.event_type)}>
                                                {event.event_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{event.region}</TableCell>
                                        <TableCell>{formatCurrency(event.amount || 0)}</TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {event.user_id}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(event.timestamp)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem>Export</DropdownMenuItem>
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
