'use client'

import { Search, Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function Topbar() {
    return (
        <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex-1 max-w-xl">
                <button
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-muted-foreground group"
                    onClick={() => {
                        // Trigger command palette
                        const event = new KeyboardEvent('keydown', {
                            key: 'k',
                            metaKey: true,
                            bubbles: true,
                        })
                        document.dispatchEvent(event)
                    }}
                >
                    <Search className="w-4 h-4" />
                    <span className="text-sm">Search...</span>
                    <div className="ml-auto flex items-center gap-1">
                        <kbd className="px-2 py-1 text-xs rounded bg-white/10 group-hover:bg-white/20 transition-colors">
                            ⌘
                        </kbd>
                        <kbd className="px-2 py-1 text-xs rounded bg-white/10 group-hover:bg-white/20 transition-colors">
                            K
                        </kbd>
                    </div>
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-y-auto">
                            <DropdownMenuItem className="flex flex-col items-start py-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="destructive">Alert</Badge>
                                    <span className="text-xs text-muted-foreground">
                                        2 minutes ago
                                    </span>
                                </div>
                                <p className="text-sm">
                                    Anomaly detected in region ID-JB
                                </p>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start py-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="default">Info</Badge>
                                    <span className="text-xs text-muted-foreground">
                                        1 hour ago
                                    </span>
                                </div>
                                <p className="text-sm">
                                    New data source connected successfully
                                </p>
                            </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center text-primary">
                            View all notifications
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Settings */}
                <Button variant="ghost" size="icon">
                    <Settings className="w-5 h-5" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 px-2">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                    JD
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium">John Doe</p>
                                <p className="text-xs text-muted-foreground">
                                    john@company.com
                                </p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
