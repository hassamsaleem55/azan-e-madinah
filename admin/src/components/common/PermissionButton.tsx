import { ReactNode, ButtonHTMLAttributes } from 'react';
import { usePermission } from '../../context/PermissionGuard';

interface PermissionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Button that only renders if user has the required permission
 * Super Admin bypasses all permission checks
 * 
 * @param permission - Permission code required (e.g., 'bookings.create')
 * @param children - Button content
 * @param fallback - Optional content to show when permission is denied
 */
export const PermissionButton = ({ 
  permission, 
  children, 
  fallback = null,
  ...buttonProps 
}: PermissionButtonProps) => {
  const { hasPermission, isSuperAdmin } = usePermission();

  // Super Admin can do everything
  if (isSuperAdmin()) {
    return <button {...buttonProps}>{children}</button>;
  }

  // Check permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <button {...buttonProps}>{children}</button>;
};

interface PermissionWrapperProps {
  permission?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper that conditionally renders content based on permission
 * Use this for non-button elements like links, divs, etc.
 */
export const PermissionWrapper = ({
  permission,
  children,
  fallback = null
}: PermissionWrapperProps) => {
  const { hasPermission, isSuperAdmin } = usePermission();

  // Super Admin can see everything
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  // Check permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
