/**
 * Advanced Command Palette Component
 * Cmd+K interface for quick navigation and actions
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Home,
    BarChart3,
    AlertCircle,
    FileText,
    Settings,
    Users,
    Sparkles,
    TrendingUp,
    Search,
    Calendar,
    Download,
} from 'lucide-react';

interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon: React.ReactNode;
    action: () => void;
    keywords?: string[];
}

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Toggle command palette with Cmd+K or Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const navigate = useCallback(
        (path: string) => {
            setOpen(false);
            router.push(path);
        },
        [router]
    );

    const commands: CommandItem[] = [
        // Navigation
        {
            id: 'nav-dashboard',
            label: 'Dashboard',
            description: 'Go to main dashboard',
            icon: <Home className="h-4 w-4" />,
            action: () => navigate('/dashboard'),
            keywords: ['home', 'main'],
        },
        {
            id: 'nav-ai-assistant',
            label: 'AI Assistant',
            description: 'Open AI chat assistant',
            icon: <Sparkles className="h-4 w-4" />,
            action: () => navigate('/dashboard/ai-assistant'),
            keywords: ['chat', 'ai', 'gemini'],
        },
        {
            id: 'nav-predictive',
            label: 'Predictive Analytics',
            description: 'View forecasts and predictions',
            icon: <TrendingUp className="h-4 w-4" />,
            action: () => navigate('/dashboard/predictive-analytics'),
            keywords: ['forecast', 'prediction', 'trends'],
        },
        {
            id: 'nav-analytics',
            label: 'Analytics',
            description: 'View detailed analytics',
            icon: <BarChart3 className="h-4 w-4" />,
            action: () => navigate('/dashboard/analytics'),
            keywords: ['charts', 'metrics'],
        },
        {
            id: 'nav-alerts',
            label: 'Alerts',
            description: 'Manage alerts and notifications',
            icon: <AlertCircle className="h-4 w-4" />,
            action: () => navigate('/dashboard/alerts'),
            keywords: ['notifications', 'warnings'],
        },
        {
            id: 'nav-reports',
            label: 'Reports',
            description: 'Generate and view reports',
            icon: <FileText className="h-4 w-4" />,
            action: () => navigate('/dashboard/reports'),
            keywords: ['export', 'pdf'],
        },
        {
            id: 'nav-settings',
            label: 'Settings',
            description: 'Configure your account',
            icon: <Settings className="h-4 w-4" />,
            action: () => navigate('/dashboard/settings'),
            keywords: ['preferences', 'config'],
        },

        // Quick Actions
        {
            id: 'action-search',
            label: 'Search Events',
            description: 'Search through all events',
            icon: <Search className="h-4 w-4" />,
            action: () => navigate('/dashboard/events?search=true'),
            keywords: ['find', 'lookup'],
        },
        {
            id: 'action-export',
            label: 'Export Data',
            description: 'Download your data',
            icon: <Download className="h-4 w-4" />,
            action: () => {
                setOpen(false);
                // Trigger export modal
            },
            keywords: ['download', 'csv', 'json'],
        },
        {
            id: 'action-schedule',
            label: 'Schedule Report',
            description: 'Set up automated reports',
            icon: <Calendar className="h-4 w-4" />,
            action: () => navigate('/dashboard/reports?schedule=true'),
            keywords: ['automate', 'recurring'],
        },
    ];

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Navigation">
                    {commands
                        .filter((cmd) => cmd.id.startsWith('nav-'))
                        .map((cmd) => (
                            <CommandItem
                                key={cmd.id}
                                onSelect={cmd.action}
                                keywords={cmd.keywords}
                            >
                                <div className="flex items-center gap-2">
                                    {cmd.icon}
                                    <div className="flex flex-col">
                                        <span>{cmd.label}</span>
                                        {cmd.description && (
                                            <span className="text-xs text-muted-foreground">
                                                {cmd.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CommandItem>
                        ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Quick Actions">
                    {commands
                        .filter((cmd) => cmd.id.startsWith('action-'))
                        .map((cmd) => (
                            <CommandItem
                                key={cmd.id}
                                onSelect={cmd.action}
                                keywords={cmd.keywords}
                            >
                                <div className="flex items-center gap-2">
                                    {cmd.icon}
                                    <div className="flex flex-col">
                                        <span>{cmd.label}</span>
                                        {cmd.description && (
                                            <span className="text-xs text-muted-foreground">
                                                {cmd.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CommandItem>
                        ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
