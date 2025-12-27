'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Settings, Bell, Shield, Palette, Database, Zap, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/lib/theme-provider';

export default function SettingsPage() {
    const supabase = createClient();
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentOrg, setCurrentOrg] = useState<any>(null);

    // Form states
    const [orgName, setOrgName] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [slackNotifications, setSlackNotifications] = useState(false);
    const [anomalyAlerts, setAnomalyAlerts] = useState(true);
    const [weeklyReports, setWeeklyReports] = useState(true);
    const [accentColor, setAccentColor] = useState('blue');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('You must be logged in');
                return;
            }

            setCurrentUser(user);
            setUserEmail(user.email || '');
            setUserName(user.user_metadata?.full_name || '');

            // Load organization
            const { data: orgMember } = await (supabase
                .from('organization_members') as any)
                .select('organization_id, organizations(*)')
                .eq('user_id', user.id)
                .single();

            if (orgMember && orgMember.organizations) {
                setCurrentOrg(orgMember.organizations);
                setOrgName(orgMember.organizations.name || '');
            }

            // Load user preferences from metadata
            if (user.user_metadata?.preferences) {
                const prefs = user.user_metadata.preferences;
                setEmailNotifications(prefs.emailNotifications ?? true);
                setSlackNotifications(prefs.slackNotifications ?? false);
                setAnomalyAlerts(prefs.anomalyAlerts ?? true);
                setWeeklyReports(prefs.weeklyReports ?? true);
                setAccentColor(prefs.accentColor ?? 'blue');
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveOrganization = async () => {
        if (!currentOrg) {
            toast.error('No organization found');
            return;
        }

        try {
            setLoading(true);

            const { error } = await (supabase
                .from('organizations') as any)
                .update({ name: orgName })
                .eq('id', currentOrg.id);

            if (error) throw error;

            toast.success('✅ Organization settings saved!');
            loadSettings(); // Reload to get updated data
        } catch (error: any) {
            console.error('Error saving organization:', error);
            toast.error('Failed to save organization settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!currentUser) {
            toast.error('You must be logged in');
            return;
        }

        try {
            setLoading(true);

            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: userName,
                }
            });

            if (error) throw error;

            toast.success('✅ Profile updated successfully!');
            loadSettings();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotifications = async () => {
        if (!currentUser) {
            toast.error('You must be logged in');
            return;
        }

        try {
            setLoading(true);

            const preferences = {
                emailNotifications,
                slackNotifications,
                anomalyAlerts,
                weeklyReports,
                accentColor,
            };

            const { error } = await supabase.auth.updateUser({
                data: {
                    preferences,
                }
            });

            if (error) throw error;

            toast.success('✅ Notification preferences saved!');
        } catch (error: any) {
            console.error('Error saving preferences:', error);
            toast.error('Failed to save preferences');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAppearance = async () => {
        try {
            setLoading(true);

            if (currentUser) {
                const preferences = {
                    emailNotifications,
                    slackNotifications,
                    anomalyAlerts,
                    weeklyReports,
                    accentColor,
                };

                await supabase.auth.updateUser({
                    data: { preferences }
                });
            }

            toast.success('✅ Appearance settings saved!');
        } catch (error: any) {
            console.error('Error saving appearance:', error);
            toast.error('Failed to save appearance');
        } finally {
            setLoading(false);
        }
    };

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
        toast.success(`🎨 Theme changed to ${newTheme}`);
    };

    if (loading && !currentUser) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="general" className="gap-2">
                        <Settings className="h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2">
                        <Palette className="h-4 w-4" />
                        Appearance
                    </TabsTrigger>
                    <TabsTrigger value="integrations" className="gap-2">
                        <Zap className="h-4 w-4" />
                        Integrations
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-4">
                    <Card className="glass-hover">
                        <CardHeader>
                            <CardTitle>Organization Settings</CardTitle>
                            <CardDescription>
                                Manage your organization's basic information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="org-name">Organization Name</Label>
                                <Input
                                    id="org-name"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    placeholder="Enter organization name"
                                />
                            </div>
                            <Button
                                onClick={handleSaveOrganization}
                                disabled={loading}
                                className="hover-lift"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Profile Settings */}
                <TabsContent value="profile" className="space-y-4">
                    <Card className="glass-hover">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="user-name">Full Name</Label>
                                <Input
                                    id="user-name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user-email">Email</Label>
                                <Input
                                    id="user-email"
                                    type="email"
                                    value={userEmail}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed here. Contact support to change your email.
                                </p>
                            </div>
                            <Button
                                onClick={handleSaveProfile}
                                disabled={loading}
                                className="hover-lift"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Profile
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card className="glass-hover">
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Choose how you want to be notified
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive notifications via email
                                    </p>
                                </div>
                                <Switch
                                    checked={emailNotifications}
                                    onCheckedChange={setEmailNotifications}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Slack Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send alerts to Slack channel
                                    </p>
                                </div>
                                <Switch
                                    checked={slackNotifications}
                                    onCheckedChange={setSlackNotifications}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Anomaly Alerts</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get notified when anomalies are detected
                                    </p>
                                </div>
                                <Switch
                                    checked={anomalyAlerts}
                                    onCheckedChange={setAnomalyAlerts}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Weekly Reports</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive weekly summary reports
                                    </p>
                                </div>
                                <Switch
                                    checked={weeklyReports}
                                    onCheckedChange={setWeeklyReports}
                                />
                            </div>

                            <Button
                                onClick={handleSaveNotifications}
                                disabled={loading}
                                className="hover-lift"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Preferences
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="space-y-4">
                    <Card className="glass-hover">
                        <CardHeader>
                            <CardTitle>Theme</CardTitle>
                            <CardDescription>Customize the appearance of the dashboard</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="theme">Color Theme</Label>
                                <Select
                                    value={theme}
                                    onValueChange={(value: 'light' | 'dark' | 'system') => handleThemeChange(value)}
                                >
                                    <SelectTrigger id="theme">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Theme changes are applied immediately and saved automatically
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accent">Accent Color</Label>
                                <Select
                                    value={accentColor}
                                    onValueChange={setAccentColor}
                                >
                                    <SelectTrigger id="accent">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="blue">Blue</SelectItem>
                                        <SelectItem value="purple">Purple</SelectItem>
                                        <SelectItem value="green">Green</SelectItem>
                                        <SelectItem value="orange">Orange</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleSaveAppearance}
                                disabled={loading}
                                className="hover-lift"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Appearance
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Integrations Settings */}
                <TabsContent value="integrations" className="space-y-4">
                    <Card className="glass-hover">
                        <CardHeader>
                            <CardTitle>Connected Services</CardTitle>
                            <CardDescription>
                                Manage your third-party integrations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Database className="h-8 w-8 text-primary" />
                                    <div>
                                        <p className="font-medium">Supabase</p>
                                        <p className="text-sm text-muted-foreground">Connected</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="hover-lift">Configure</Button>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Zap className="h-8 w-8 text-yellow-500" />
                                    <div>
                                        <p className="font-medium">Kafka</p>
                                        <p className="text-sm text-muted-foreground">Connected</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="hover-lift">Configure</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
