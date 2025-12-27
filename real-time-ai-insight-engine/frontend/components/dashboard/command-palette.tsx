'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import {
    LayoutDashboard,
    Activity,
    Bell,
    Settings,
    Users,
    Database,
    BarChart3,
    Webhook,
    Key,
} from 'lucide-react'

export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const navigate = (path: string) => {
        setOpen(false)
        router.push(path)
    }

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => navigate('/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/dashboard/events')}>
                        <Activity className="mr-2 h-4 w-4" />
                        <span>Events</span>
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/dashboard/insights')}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>AI Insights</span>
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/dashboard/alerts')}>
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Alerts</span>
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/dashboard/sources')}>
                        <Database className="mr-2 h-4 w-4" />
                        <span>Data Sources</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => navigate('/dashboard/webhooks')}>
                        <Webhook className="mr-2 h-4 w-4" />
                        <span>Webhooks</span>
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/dashboard/api-keys')}>
                        <Key className="mr-2 h-4 w-4" />
                        <span>API Keys</span>
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/dashboard/team')}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Team</span>
                    </CommandItem>
                    <CommandItem onSelect={() => navigate('/dashboard/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
