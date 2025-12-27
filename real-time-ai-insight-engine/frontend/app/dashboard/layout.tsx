import React from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'
import { CommandPalette } from '@/components/dashboard/command-palette'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <TooltipProvider>
            <div className="h-screen flex overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Topbar />
                    <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-background via-background to-background/95">
                        {children}
                    </main>
                </div>
                <CommandPalette />
            </div>
        </TooltipProvider>
    )
}
