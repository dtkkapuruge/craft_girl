/**
 * Role-Based Access Control (RBAC) Utility
 * 3-tier system: super-admin, admin, staff
 */

export type UserRole = 'customer' | 'staff' | 'admin' | 'super-admin';

export interface RolePermission {
  canViewDashboard: boolean;
  canViewProducts: boolean;
  canManageProducts: boolean;
  canViewOrders: boolean;
  canManageOrders: boolean;
  canUpdateOrderStatus: boolean;
  canViewRevenue: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canManageStaff: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermission> = {
  customer: {
    canViewDashboard: false,
    canViewProducts: true,
    canManageProducts: false,
    canViewOrders: false,
    canManageOrders: false,
    canUpdateOrderStatus: false,
    canViewRevenue: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canManageStaff: false,
  },
  staff: {
    canViewDashboard: true,
    canViewProducts: true,
    canManageProducts: false,
    canViewOrders: true,
    canManageOrders: false,
    canUpdateOrderStatus: false,
    canViewRevenue: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canManageStaff: false,
  },
  admin: {
    canViewDashboard: true,
    canViewProducts: true,
    canManageProducts: true,
    canViewOrders: true,
    canManageOrders: true,
    canUpdateOrderStatus: true,
    canViewRevenue: false,
    canViewAnalytics: true,
    canManageUsers: false,
    canManageStaff: false,
  },
  'super-admin': {
    canViewDashboard: true,
    canViewProducts: true,
    canManageProducts: true,
    canViewOrders: true,
    canManageOrders: true,
    canUpdateOrderStatus: true,
    canViewRevenue: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canManageStaff: true,
  },
};

/**
 * Get permissions for a specific role
 */
export const getPermissions = (role: UserRole): RolePermission => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.customer;
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (
  role: UserRole,
  permission: keyof RolePermission
): boolean => {
  const permissions = getPermissions(role);
  return permissions[permission];
};

/**
 * Check if a role has admin or higher access
 */
export const isAdminOrHigher = (role: UserRole): boolean => {
  return role === 'admin' || role === 'super-admin';
};

/**
 * Check if a role is super-admin
 */
export const isSuperAdmin = (role: UserRole): boolean => {
  return role === 'super-admin';
};

/**
 * Check if a role has dashboard access
 */
export const hasDashboardAccess = (role: UserRole): boolean => {
  return hasPermission(role, 'canViewDashboard');
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    customer: 'Customer',
    staff: 'Staff Member',
    admin: 'Administrator',
    'super-admin': 'Super Administrator',
  };
  return roleNames[role] || 'Unknown Role';
};

/**
 * Get role color for UI display
 */
export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    customer: '#9CA3AF',
    staff: '#3B82F6',
    admin: '#F59E0B',
    'super-admin': '#EF4444',
  };
  return roleColors[role] || '#9CA3AF';
};
