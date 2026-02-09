import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { ReactNode } from "react";

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  role?: string;
  anyRole?: string[];
  redirectTo?: string;
}

/**
 * PermissionGuard - Protects routes based on user permissions
 * 
 * @param children - The component to render if user has permission
 * @param permission - The permission code required (e.g., 'bookings.create')
 * @param role - Alternative: check for specific role (e.g., 'Admin')
 * @param anyRole - Alternative: check if user has any of these roles
 * @param redirectTo - Where to redirect if no permission (default: '/')
 */
export const PermissionGuard = ({ 
  children, 
  permission, 
  role, 
  anyRole,
  redirectTo = "/" 
}: PermissionGuardProps) => {
  const { activeRole, permissions, loading, isSuperAdmin } = useAuth();

  // Wait for auth to load
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not logged in
  if (!activeRole) {
    return <Navigate to="/auth/login" replace />;
  }

  // Super Admin has access to everything
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  // Check permission
  if (permission) {
    const hasPermission = permissions.some(p => p.code === permission && p.isActive);
    if (!hasPermission) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Check specific role
  if (role) {
    if (activeRole?.name !== role) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Check if user has any of the specified roles
  if (anyRole && Array.isArray(anyRole)) {
    if (!anyRole.includes(activeRole?.name)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};

/**
 * Hook to use permission checks in components
 */
export const usePermission = () => {
  const { permissions, activeRole, isSuperAdmin } = useAuth();

  const hasPermission = (permissionCode: string): boolean => {
    if (isSuperAdmin()) return true;
    return permissions.some(p => p.code === permissionCode && p.isActive);
  };

  const hasRole = (roleName: string): boolean => {
    return activeRole?.name === roleName;
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.includes(activeRole?.name || '');
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    isSuperAdmin
  };
};

export default PermissionGuard;
