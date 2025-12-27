'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MahasiAILogo } from '@/components/branding/MahasiAILogo'
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
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Events', href: '/dashboard/events', icon: Activity },
    { name: 'Insights', href: '/dashboard/insights', icon: BarChart3 },
    { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
    { name: 'Data Sources', href: '/dashboard/sources', icon: Database },
    { name: 'Redis Cache', href: '/dashboard/redis', icon: Database },
    { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
    { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
    { name: 'Team', href: '/dashboard/team', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div
            className={cn(
                'glass border-r border-white/10 flex flex-col transition-all duration-300',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 animate-slide-down">
                {!collapsed && (
                    <Link href="/dashboard" className="flex items-center hover-scale">
                        <MahasiAILogo variant="gradient" />
                    </Link>
                )}
                {collapsed && (
                    <Link href="/dashboard" className="flex items-center justify-center w-full hover-scale">
                        <MahasiAILogo variant="gradient" showText={false} />
                    </Link>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-110 button-press"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5 transition-transform duration-300" />
                    ) : (
                        <ChevronLeft className="w-5 h-5 transition-transform duration-300" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group animate-fade-right',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground hover:scale-105 hover-lift'
                            )}
                            style={{ animationDelay: `${index * 30}ms` }}
                            title={collapsed ? item.name : undefined}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 flex-shrink-0 transition-transform duration-300",
                                !isActive && "group-hover:rotate-12 group-hover:scale-110"
                            )} />
                            {!collapsed && (
                                <span className="font-medium">{item.name}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-white/10">
                <div
                    className={cn(
                        'flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors',
                        collapsed && 'justify-center'
                    )}
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">JD</span>
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">John Doe</p>
                            <p className="text-xs text-muted-foreground truncate">
                                john@company.com
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
