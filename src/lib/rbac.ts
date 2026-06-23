import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Role-Based Access Control (RBAC) Utility
 * Supports 3 built-in tiers (super-admin, admin, staff) +
 * unlimited custom roles stored in Firestore.
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
  canManagePermissions: boolean;
}

/**
 * A dynamically created custom role (stored only in Firestore, not the static enum).
 */
export interface CustomRole {
  key: string;       // Firestore doc id, e.g. "merchandiser"
  name: string;      // Display name, e.g. "Merchandiser"
  isCustom: true;
  permissions: RolePermission;
}

/**
 * Default all-false permissions — used to initialise new custom roles.
 */
export const DEFAULT_PERMISSIONS: RolePermission = {
  canViewDashboard: false,
  canViewProducts: false,
  canManageProducts: false,
  canViewOrders: false,
  canManageOrders: false,
  canUpdateOrderStatus: false,
  canViewRevenue: false,
  canViewAnalytics: false,
  canManageUsers: false,
  canManageStaff: false,
  canManagePermissions: false,
};

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
    canManagePermissions: false,
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
    canManagePermissions: false,
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
    canManagePermissions: false,
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
    canManagePermissions: true,
  },
};

/**
 * Get static (hardcoded) permissions for a built-in role.
 */
export const getPermissions = (role: UserRole): RolePermission => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.customer;
};

/**
 * Fetch dynamic role permissions from Firestore (falls back to static defaults).
 */
export async function fetchRolePermissions(role: UserRole): Promise<RolePermission> {
  try {
    const docRef = doc(db, 'roles', role);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const defaults = getPermissions(role);
      return { ...defaults, ...data } as RolePermission;
    }
  } catch (err) {
    console.error(`Failed to fetch dynamic permissions for role ${role}:`, err);
  }
  return getPermissions(role);
}

/**
 * Fetch permissions for a custom (non-built-in) role from Firestore.
 */
export async function fetchCustomRolePermissions(roleKey: string): Promise<RolePermission> {
  try {
    const docRef = doc(db, 'roles', roleKey);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { _meta, ...permData } = docSnap.data();
      return { ...DEFAULT_PERMISSIONS, ...permData } as RolePermission;
    }
  } catch (err) {
    console.error(`Failed to fetch permissions for custom role ${roleKey}:`, err);
  }
  return { ...DEFAULT_PERMISSIONS };
}

/**
 * Save dynamic role permissions to Firestore.
 * Works for both built-in and custom roles.
 */
export async function saveRolePermissions(
  role: string,
  permissions: RolePermission
): Promise<void> {
  const docRef = doc(db, 'roles', role);
  // Strip the boolean permissions only (exclude _meta)
  const payload: Partial<RolePermission> = { ...permissions };
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Create a brand-new custom role in Firestore with all-false permissions.
 */
export async function createNewRole(key: string, name: string): Promise<void> {
  const normalized = key.trim().toLowerCase().replace(/\s+/g, '-');
  const docRef = doc(db, 'roles', normalized);
  await setDoc(docRef, {
    ...DEFAULT_PERMISSIONS,
    _meta: { name, isCustom: true, createdAt: new Date().toISOString() },
  });
}

/**
 * Fetch ALL custom (non-built-in) roles stored in Firestore's `roles` collection.
 */
export async function fetchAllCustomRoles(): Promise<CustomRole[]> {
  try {
    const snapshot = await getDocs(collection(db, 'roles'));
    const builtIn: string[] = ['customer', 'staff', 'admin', 'super-admin'];
    const roles: CustomRole[] = [];
    snapshot.forEach((d) => {
      if (!builtIn.includes(d.id)) {
        const data = d.data();
        const meta = data._meta ?? {};
        const { _meta, ...permData } = data;
        roles.push({
          key: d.id,
          name: meta.name ?? d.id,
          isCustom: true,
          permissions: { ...DEFAULT_PERMISSIONS, ...permData } as RolePermission,
        });
      }
    });
    return roles;
  } catch (err) {
    console.error('Failed to fetch custom roles:', err);
    return [];
  }
}

/**
 * Check if a role has a specific permission (supports dynamic overrides).
 */
export const hasPermission = (
  role: UserRole,
  permission: keyof RolePermission,
  customPermissions?: RolePermission | null
): boolean => {
  if (customPermissions) {
    return customPermissions[permission] ?? false;
  }
  const permissions = getPermissions(role);
  return permissions[permission] ?? false;
};

/** Check if a role has admin or higher access. */
export const isAdminOrHigher = (role: UserRole): boolean =>
  role === 'admin' || role === 'super-admin';

/** Check if a role is super-admin. */
export const isSuperAdmin = (role: UserRole): boolean => role === 'super-admin';

/** Check if a role has dashboard access. */
export const hasDashboardAccess = (
  role: UserRole,
  customPermissions?: RolePermission | null
): boolean => hasPermission(role, 'canViewDashboard', customPermissions);

/** Human-readable role name. */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    customer: 'Customer',
    staff: 'Staff Member',
    admin: 'Administrator',
    'super-admin': 'Super Administrator',
  };
  return roleNames[role] || 'Unknown Role';
};

/** Role badge colour. */
export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    customer: '#9CA3AF',
    staff: '#3B82F6',
    admin: '#F59E0B',
    'super-admin': '#EF4444',
  };
  return roleColors[role] || '#9CA3AF';
};
