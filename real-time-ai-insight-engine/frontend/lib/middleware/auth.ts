import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface AuthUser {
    id: string;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    metadata?: Record<string, any>;
}

export async function authenticate(request: NextRequest): Promise<AuthUser | null> {
    try {
        const supabase = createClient();

        // Get user from Supabase session
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        // Get user role from profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, metadata')
            .eq('id', user.id)
            .single();

        return {
            id: user.id,
            email: user.email || '',
            role: profile?.role || 'user',
            metadata: profile?.metadata,
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}

export function requireAuth(handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
        const user = await authenticate(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication required' },
                { status: 401 }
            );
        }

        return handler(request, user);
    };
}

export function requireRole(
    roles: Array<'admin' | 'user' | 'viewer'>,
    handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
    return async (request: NextRequest) => {
        const user = await authenticate(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication required' },
                { status: 401 }
            );
        }

        if (!roles.includes(user.role)) {
            return NextResponse.json(
                { error: 'Forbidden', message: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        return handler(request, user);
    };
}

// Audit logging helper
export async function logAuditEvent(
    userId: string,
    action: string,
    resource: string,
    details?: Record<string, any>
) {
    try {
        const supabase = createClient();
        await supabase.from('audit_logs').insert({
            user_id: userId,
            action,
            resource,
            details,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Audit logging error:', error);
    }
}
