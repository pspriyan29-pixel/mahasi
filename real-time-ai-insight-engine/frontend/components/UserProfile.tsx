'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileProps {
    className?: string;
}

export function UserProfile({ className }: UserProfileProps) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            toast.success('Signed out successfully');
            router.push('/auth/login');
        } catch (error: any) {
            toast.error('Error signing out: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 animate-pulse ${className}`} />
        );
    }

    if (!user) {
        return null;
    }

    const getInitials = (name?: string, email?: string) => {
        if (name) {
            return name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        if (email) {
            return email.slice(0, 2).toUpperCase();
        }
        return 'U';
    };

    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const avatarUrl = user.user_metadata?.avatar_url;
    const initials = getInitials(user.user_metadata?.full_name, user.email);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={`focus:outline-none ${className}`}>
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition-all">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs sm:text-sm font-medium">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-white">{displayName}</p>
                        <p className="text-xs leading-none text-gray-400 truncate">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                    className="cursor-pointer text-gray-300 focus:bg-gray-700 focus:text-white"
                    onClick={() => router.push('/dashboard')}
                >
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer text-gray-300 focus:bg-gray-700 focus:text-white"
                    onClick={() => router.push('/dashboard/settings')}
                >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                    className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
