import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requirePermission,
  hasRolePermission,
  getPermissionsForRole,
} from '../lib/rbac/service';
import { ROLE_PERMISSIONS, ALL_PERMISSIONS } from '../lib/rbac/permissions';
import type { PermissionName, UserRole } from '@saarthi/shared-types';

describe('RBAC Role & Permission System', () => {
  it('should define all 7 required user roles per PRD.md & WORKFLOW.md', () => {
    const roles: UserRole[] = [
      'owner',
      'team_member',
      'ca_partner',
      'supplier',
      'influencer',
      'lender',
      'admin',
    ];
    for (const role of roles) {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
      expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true);
    }
  });

  it('owner should have all core business, compliance, and consent permissions', () => {
    const ownerPerms = getPermissionsForRole('owner');
    expect(ownerPerms).toContain('compliance.manage');
    expect(ownerPerms).toContain('consents.grant');
    expect(ownerPerms).toContain('consents.revoke');
    expect(ownerPerms).toContain('team.invite');
    expect(ownerPerms).toContain('business.update_profile');
    expect(ownerPerms).not.toContain('admin.all');
  });

  it('team_member should have operational compliance but not consent or role management', () => {
    const teamPerms = getPermissionsForRole('team_member');
    expect(teamPerms).toContain('compliance.view');
    expect(teamPerms).toContain('compliance.manage');
    expect(teamPerms).toContain('documents.upload');
    expect(teamPerms).not.toContain('consents.grant');
    expect(teamPerms).not.toContain('team.manage_roles');
  });

  it('ca_partner should have compliance export and audit view but not marketplace sell', () => {
    const caPerms = getPermissionsForRole('ca_partner');
    expect(caPerms).toContain('compliance.export');
    expect(caPerms).toContain('audit.view');
    expect(caPerms).not.toContain('marketplace.sell');
  });

  it('lender should only have read-only score, business, and compliance view', () => {
    const lenderPerms = getPermissionsForRole('lender');
    expect(lenderPerms).toContain('score.view');
    expect(lenderPerms).toContain('business.view');
    expect(lenderPerms).toContain('compliance.view');
    expect(lenderPerms).not.toContain('compliance.manage');
    expect(lenderPerms).not.toContain('documents.upload');
  });

  it('admin should possess all permissions via admin.all', () => {
    const adminPerms = getPermissionsForRole('admin');
    expect(hasPermission(adminPerms, 'admin.all')).toBe(true);
    expect(hasPermission(adminPerms, 'compliance.manage')).toBe(true);
    expect(hasPermission(adminPerms, 'consents.grant')).toBe(true);
  });

  it('hasAnyPermission should return true if any permission matches', () => {
    const userPerms: PermissionName[] = ['compliance.view', 'documents.view'];
    expect(hasAnyPermission(userPerms, ['compliance.manage', 'compliance.view'])).toBe(true);
    expect(hasAnyPermission(userPerms, ['consents.grant', 'team.invite'])).toBe(false);
  });

  it('hasAllPermissions should return true only if all permissions match', () => {
    const userPerms: PermissionName[] = ['compliance.view', 'documents.view', 'score.view'];
    expect(hasAllPermissions(userPerms, ['compliance.view', 'score.view'])).toBe(true);
    expect(hasAllPermissions(userPerms, ['compliance.view', 'consents.grant'])).toBe(false);
  });

  it('requirePermission should throw a descriptive error when permission is missing', () => {
    const userPerms: PermissionName[] = ['compliance.view'];
    expect(() => requirePermission(userPerms, 'compliance.manage', 'test action')).toThrowError(
      /Forbidden: Missing required permission 'compliance.manage' for test action/
    );
  });
});
