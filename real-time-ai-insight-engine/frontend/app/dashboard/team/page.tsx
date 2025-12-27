'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Plus, Mail, Shield, Trash2, UserPlus } from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    status: 'active' | 'pending';
    joinedAt: string;
}

export default function TeamPage() {
    const [teamMembers] = useState<TeamMember[]>([
        {
            id: '1',
            name: 'John Doe',
            email: 'john@company.com',
            role: 'owner',
            status: 'active',
            joinedAt: '2024-01-01',
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@company.com',
            role: 'admin',
            status: 'active',
            joinedAt: '2024-01-15',
        },
        {
            id: '3',
            name: 'Bob Johnson',
            email: 'bob@company.com',
            role: 'member',
            status: 'active',
            joinedAt: '2024-02-01',
        },
        {
            id: '4',
            name: 'Alice Williams',
            email: 'alice@company.com',
            role: 'viewer',
            status: 'pending',
            joinedAt: '2024-02-10',
        },
    ]);

    const getRoleBadgeVariant = (role: TeamMember['role']) => {
        switch (role) {
            case 'owner':
                return 'default';
            case 'admin':
                return 'secondary';
            case 'member':
                return 'outline';
            case 'viewer':
                return 'outline';
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">Team</h1>
                    <p className="text-muted-foreground">
                        Manage your team members and their permissions
                    </p>
                </div>
                <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Members
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamMembers.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active
                        </CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {teamMembers.filter((m) => m.status === 'active').length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending
                        </CardTitle>
                        <Mail className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {teamMembers.filter((m) => m.status === 'pending').length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Admins
                        </CardTitle>
                        <Shield className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {teamMembers.filter((m) => m.role === 'admin' || m.role === 'owner').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Members List */}
            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage roles and permissions for your team</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium">{member.name}</p>
                                            <Badge variant={getRoleBadgeVariant(member.role)}>
                                                {member.role}
                                            </Badge>
                                            {member.status === 'pending' && (
                                                <Badge variant="outline" className="text-yellow-500">
                                                    Pending
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        Joined {member.joinedAt}
                                    </span>
                                    {member.role !== 'owner' && (
                                        <>
                                            <Button variant="outline" size="sm">
                                                Change Role
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Roles & Permissions */}
            <Card>
                <CardHeader>
                    <CardTitle>Roles & Permissions</CardTitle>
                    <CardDescription>Understanding team member roles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Badge>Owner</Badge>
                            <p className="text-sm text-muted-foreground">
                                Full access to all features, including billing and team management
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Badge variant="secondary">Admin</Badge>
                            <p className="text-sm text-muted-foreground">
                                Can manage team members, data sources, and all dashboard features
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Badge variant="outline">Member</Badge>
                            <p className="text-sm text-muted-foreground">
                                Can view and analyze data, create alerts, but cannot manage team
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Badge variant="outline">Viewer</Badge>
                            <p className="text-sm text-muted-foreground">
                                Read-only access to dashboards and insights
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
