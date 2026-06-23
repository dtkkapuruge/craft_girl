'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserRole } from '@/lib/rbac';
import { hasPermission } from '@/lib/rbac';

interface AdminGuardProps {
  children: ReactNode;
  requiredPermission?: keyof import('@/lib/rbac').RolePermission;
  minRole?: UserRole | UserRole[];
  fallback?: ReactNode;
}

export default function AdminGuard({
  children,
  requiredPermission,
  minRole,
  fallback,
}: AdminGuardProps) {
  const { user, loading, role, permissions } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // If user is not authenticated, redirect to admin login
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // Check permission if specified
    if (requiredPermission) {
      if (!hasPermission(role, requiredPermission, permissions)) {
        router.push('/admin/login');
        return;
      }
    }

    // Check minimum role if specified
    if (minRole) {
      const minRoles = Array.isArray(minRole) ? minRole : [minRole];
      if (!minRoles.includes(role)) {
        router.push('/admin/login');
        return;
      }
    }
  }, [user, loading, role, permissions, requiredPermission, minRole, router]);

  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-[#E5E0D8] border-t-[#442852] rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-[#2D2D2D] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If user doesn't have access, show fallback or nothing
  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-[#2D2D2D] font-medium mb-4">Access Denied</p>
          <p className="text-sm text-gray-500">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check permission if specified
  if (requiredPermission && !hasPermission(role, requiredPermission, permissions)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-[#2D2D2D] font-medium mb-4">Insufficient Permissions</p>
          <p className="text-sm text-gray-500">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check minimum role if specified
  if (minRole) {
    const minRoles = Array.isArray(minRole) ? minRole : [minRole];
    if (!minRoles.includes(role)) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-[#2D2D2D] font-medium mb-4">Access Denied</p>
            <p className="text-sm text-gray-500">You don't have the required role to access this page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
