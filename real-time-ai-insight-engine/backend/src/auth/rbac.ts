/**
 * Role-Based Access Control (RBAC) System
 * Enterprise-grade permission management
 */

import { logger } from '../utils/logger';

// Define roles hierarchy
export enum Role {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    MANAGER = 'manager',
    ANALYST = 'analyst',
    VIEWER = 'viewer',
}

// Define permissions
export enum Permission {
    // Organization management
    ORG_CREATE = 'org:create',
    ORG_READ = 'org:read',
    ORG_UPDATE = 'org:update',
    ORG_DELETE = 'org:delete',

    // User management
    USER_CREATE = 'user:create',
    USER_READ = 'user:read',
    USER_UPDATE = 'user:update',
    USER_DELETE = 'user:delete',
    USER_INVITE = 'user:invite',

    // Event management
    EVENT_CREATE = 'event:create',
    EVENT_READ = 'event:read',
    EVENT_UPDATE = 'event:update',
    EVENT_DELETE = 'event:delete',

    // AI Insights
    INSIGHT_READ = 'insight:read',
    INSIGHT_CREATE = 'insight:create',
    INSIGHT_DELETE = 'insight:delete',

    // Alerts
    ALERT_READ = 'alert:read',
    ALERT_UPDATE = 'alert:update',
    ALERT_DELETE = 'alert:delete',

    // Reports
    REPORT_CREATE = 'report:create',
    REPORT_READ = 'report:read',
    REPORT_EXPORT = 'report:export',

    // Settings
    SETTINGS_READ = 'settings:read',
    SETTINGS_UPDATE = 'settings:update',

    // API Keys
    API_KEY_CREATE = 'api_key:create',
    API_KEY_READ = 'api_key:read',
    API_KEY_DELETE = 'api_key:delete',

    // Billing
    BILLING_READ = 'billing:read',
    BILLING_UPDATE = 'billing:update',
}

// Role-Permission mapping
const rolePermissions: Record<Role, Permission[]> = {
    [Role.SUPER_ADMIN]: Object.values(Permission), // All permissions

    [Role.ADMIN]: [
        Permission.ORG_READ,
        Permission.ORG_UPDATE,
        Permission.USER_CREATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.USER_INVITE,
        Permission.EVENT_CREATE,
        Permission.EVENT_READ,
        Permission.EVENT_UPDATE,
        Permission.EVENT_DELETE,
        Permission.INSIGHT_READ,
        Permission.INSIGHT_CREATE,
        Permission.INSIGHT_DELETE,
        Permission.ALERT_READ,
        Permission.ALERT_UPDATE,
        Permission.ALERT_DELETE,
        Permission.REPORT_CREATE,
        Permission.REPORT_READ,
        Permission.REPORT_EXPORT,
        Permission.SETTINGS_READ,
        Permission.SETTINGS_UPDATE,
        Permission.API_KEY_CREATE,
        Permission.API_KEY_READ,
        Permission.API_KEY_DELETE,
        Permission.BILLING_READ,
    ],

    [Role.MANAGER]: [
        Permission.ORG_READ,
        Permission.USER_READ,
        Permission.USER_INVITE,
        Permission.EVENT_CREATE,
        Permission.EVENT_READ,
        Permission.EVENT_UPDATE,
        Permission.INSIGHT_READ,
        Permission.INSIGHT_CREATE,
        Permission.ALERT_READ,
        Permission.ALERT_UPDATE,
        Permission.REPORT_CREATE,
        Permission.REPORT_READ,
        Permission.REPORT_EXPORT,
        Permission.SETTINGS_READ,
        Permission.API_KEY_READ,
    ],

    [Role.ANALYST]: [
        Permission.ORG_READ,
        Permission.USER_READ,
        Permission.EVENT_READ,
        Permission.INSIGHT_READ,
        Permission.INSIGHT_CREATE,
        Permission.ALERT_READ,
        Permission.REPORT_CREATE,
        Permission.REPORT_READ,
        Permission.REPORT_EXPORT,
        Permission.SETTINGS_READ,
    ],

    [Role.VIEWER]: [
        Permission.ORG_READ,
        Permission.EVENT_READ,
        Permission.INSIGHT_READ,
        Permission.ALERT_READ,
        Permission.REPORT_READ,
        Permission.SETTINGS_READ,
    ],
};

// Role hierarchy (higher roles inherit lower role permissions)
const roleHierarchy: Record<Role, number> = {
    [Role.SUPER_ADMIN]: 5,
    [Role.ADMIN]: 4,
    [Role.MANAGER]: 3,
    [Role.ANALYST]: 2,
    [Role.VIEWER]: 1,
};

export interface User {
    id: string;
    email: string;
    role: Role;
    organizationId: string;
    customPermissions?: Permission[];
}

export class RBACService {
    /**
     * Check if a role has a specific permission
     */
    static hasPermission(role: Role, permission: Permission): boolean {
        const permissions = rolePermissions[role];
        return permissions.includes(permission);
    }

    /**
     * Check if a user has a specific permission
     */
    static userHasPermission(user: User, permission: Permission): boolean {
        // Check role-based permissions
        const hasRolePermission = this.hasPermission(user.role, permission);

        // Check custom permissions
        const hasCustomPermission = user.customPermissions?.includes(permission) || false;

        return hasRolePermission || hasCustomPermission;
    }

    /**
     * Check if a user has any of the specified permissions
     */
    static userHasAnyPermission(user: User, permissions: Permission[]): boolean {
        return permissions.some(permission => this.userHasPermission(user, permission));
    }

    /**
     * Check if a user has all of the specified permissions
     */
    static userHasAllPermissions(user: User, permissions: Permission[]): boolean {
        return permissions.every(permission => this.userHasPermission(user, permission));
    }

    /**
     * Get all permissions for a role
     */
    static getRolePermissions(role: Role): Permission[] {
        return rolePermissions[role] || [];
    }

    /**
     * Get all permissions for a user
     */
    static getUserPermissions(user: User): Permission[] {
        const rolePerms = this.getRolePermissions(user.role);
        const customPerms = user.customPermissions || [];

        // Combine and deduplicate
        return Array.from(new Set([...rolePerms, ...customPerms]));
    }

    /**
     * Check if one role is higher than another
     */
    static isRoleHigher(role1: Role, role2: Role): boolean {
        return roleHierarchy[role1] > roleHierarchy[role2];
    }

    /**
     * Check if a user can manage another user
     */
    static canManageUser(manager: User, target: User): boolean {
        // Same organization check
        if (manager.organizationId !== target.organizationId) {
            return false;
        }

        // Role hierarchy check
        return this.isRoleHigher(manager.role, target.role);
    }

    /**
     * Validate permission for action
     */
    static validatePermission(user: User, permission: Permission): void {
        if (!this.userHasPermission(user, permission)) {
            throw new Error(`Permission denied: ${permission}`);
        }
    }

    /**
     * Create permission middleware for Express
     */
    static requirePermission(...permissions: Permission[]) {
        return (req: any, res: any, next: any) => {
            const user = req.user as User;

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const hasPermission = this.userHasAllPermissions(user, permissions);

            if (!hasPermission) {
                logger.warn(`Permission denied for user ${user.id}: ${permissions.join(', ')}`);
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You do not have permission to perform this action',
                    required: permissions,
                });
            }

            next();
        };
    }

    /**
     * Create role middleware for Express
     */
    static requireRole(...roles: Role[]) {
        return (req: any, res: any, next: any) => {
            const user = req.user as User;

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (!roles.includes(user.role)) {
                logger.warn(`Role check failed for user ${user.id}: required ${roles.join(', ')}, has ${user.role}`);
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Insufficient role privileges',
                    required: roles,
                    current: user.role,
                });
            }

            next();
        };
    }

    /**
     * Create organization ownership middleware
     */
    static requireOrganization() {
        return (req: any, res: any, next: any) => {
            const user = req.user as User;
            const orgId = req.params.organizationId || req.body.organizationId;

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (user.role !== Role.SUPER_ADMIN && user.organizationId !== orgId) {
                logger.warn(`Organization check failed for user ${user.id}: required ${orgId}, has ${user.organizationId}`);
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You do not have access to this organization',
                });
            }

            next();
        };
    }

    /**
     * Grant custom permission to user
     */
    static grantPermission(user: User, permission: Permission): User {
        if (!user.customPermissions) {
            user.customPermissions = [];
        }

        if (!user.customPermissions.includes(permission)) {
            user.customPermissions.push(permission);
        }

        return user;
    }

    /**
     * Revoke custom permission from user
     */
    static revokePermission(user: User, permission: Permission): User {
        if (user.customPermissions) {
            user.customPermissions = user.customPermissions.filter(p => p !== permission);
        }

        return user;
    }

    /**
     * Check resource ownership
     */
    static isResourceOwner(user: User, resourceOwnerId: string): boolean {
        return user.id === resourceOwnerId;
    }

    /**
     * Create resource ownership middleware
     */
    static requireResourceOwnership(getResourceOwnerId: (req: any) => Promise<string>) {
        return async (req: any, res: any, next: any) => {
            const user = req.user as User;

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            try {
                const ownerId = await getResourceOwnerId(req);

                // Super admin can access anything
                if (user.role === Role.SUPER_ADMIN) {
                    return next();
                }

                // Check ownership
                if (!this.isResourceOwner(user, ownerId)) {
                    logger.warn(`Resource ownership check failed for user ${user.id}`);
                    return res.status(403).json({
                        error: 'Forbidden',
                        message: 'You do not own this resource',
                    });
                }

                next();
            } catch (error) {
                logger.error('Error checking resource ownership:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        };
    }
}

// Export helper functions
export const RBAC = {
    hasPermission: RBACService.hasPermission.bind(RBACService),
    userHasPermission: RBACService.userHasPermission.bind(RBACService),
    requirePermission: RBACService.requirePermission.bind(RBACService),
    requireRole: RBACService.requireRole.bind(RBACService),
    requireOrganization: RBACService.requireOrganization.bind(RBACService),
    requireResourceOwnership: RBACService.requireResourceOwnership.bind(RBACService),
};
