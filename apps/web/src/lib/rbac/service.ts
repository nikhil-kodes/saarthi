import type { PermissionName, UserRole } from '@saarthi/shared-types';
import { ROLE_PERMISSIONS } from './permissions';

/**
 * Checks whether a given role possesses a specific permission.
 */
export function hasRolePermission(role: UserRole, permission: PermissionName): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Checks whether a list of permissions includes the required permission.
 * 'admin.all' automatically grants all permissions.
 */
export function hasPermission(
  userPermissions: PermissionName[],
  requiredPermission: PermissionName
): boolean {
  if (userPermissions.includes('admin.all')) {
    return true;
  }
  return userPermissions.includes(requiredPermission);
}

/**
 * Checks whether the user has at least one of the provided permissions.
 */
export function hasAnyPermission(
  userPermissions: PermissionName[],
  requiredPermissions: PermissionName[]
): boolean {
  if (userPermissions.includes('admin.all')) {
    return true;
  }
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
}

/**
 * Checks whether the user has all of the provided permissions.
 */
export function hasAllPermissions(
  userPermissions: PermissionName[],
  requiredPermissions: PermissionName[]
): boolean {
  if (userPermissions.includes('admin.all')) {
    return true;
  }
  return requiredPermissions.every((perm) => userPermissions.includes(perm));
}

/**
 * Returns the effective list of permissions granted to a specific user role.
 */
export function getPermissionsForRole(role: UserRole): PermissionName[] {
  return [...(ROLE_PERMISSIONS[role] || [])];
}

/**
 * Throws an authorization error if the permission check fails.
 */
export function requirePermission(
  userPermissions: PermissionName[],
  requiredPermission: PermissionName,
  context?: string
): void {
  if (!hasPermission(userPermissions, requiredPermission)) {
    throw new Error(
      `Forbidden: Missing required permission '${requiredPermission}'${
        context ? ` for ${context}` : ''
      }`
    );
  }
}
