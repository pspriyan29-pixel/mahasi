'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion, Inbox, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
    icon?: React.ReactNode
    title: string
    description: string
    action?: {
        label: string
        onClick: () => void
    }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <Card className="glass">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    {icon || <Inbox className="w-8 h-8 text-muted-foreground" />}
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
                {action && (
                    <Button onClick={action.onClick} variant="outline">
                        {action.label}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

export function NoEventsState() {
    return (
        <EmptyState
            icon={<Inbox className="w-8 h-8 text-muted-foreground" />}
            title="No events yet"
            description="Start sending events to see them appear here. Use the API or integrate with your data sources."
        />
    )
}

export function NoInsightsState() {
    return (
        <EmptyState
            icon={<FileQuestion className="w-8 h-8 text-muted-foreground" />}
            title="No insights generated"
            description="Insights will appear here once we have enough data to analyze. Keep sending events!"
        />
    )
}

export function NoAlertsState() {
    return (
        <EmptyState
            icon={<Inbox className="w-8 h-8 text-muted-foreground" />}
            title="No alerts"
            description="You're all caught up! Alerts will appear here when anomalies are detected."
        />
    )
}

export function SearchEmptyState({ query }: { query: string }) {
    return (
        <EmptyState
            icon={<SearchX className="w-8 h-8 text-muted-foreground" />}
            title="No results found"
            description={`No results found for "${query}". Try adjusting your search or filters.`}
        />
    )
}
