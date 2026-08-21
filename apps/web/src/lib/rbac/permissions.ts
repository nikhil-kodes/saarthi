import type { PermissionName, UserRole } from '@saarthi/shared-types';

export const ALL_PERMISSIONS: readonly PermissionName[] = [
  'compliance.view',
  'compliance.manage',
  'compliance.export',
  'documents.view',
  'documents.upload',
  'documents.delete',
  'business.view',
  'business.update_profile',
  'business.verify',
  'team.view',
  'team.invite',
  'team.manage_roles',
  'team.remove',
  'marketplace.buy',
  'marketplace.sell',
  'marketplace.manage_rfq',
  'campaigns.create',
  'campaigns.collaborate',
  'campaigns.payout',
  'score.view',
  'score.share',
  'consents.view',
  'consents.grant',
  'consents.revoke',
  'audit.view',
  'admin.all',
] as const;

/**
 * Standard Role-to-Permissions Mapping Matrix
 * This matches the database seed in 00002_seed_rbac.sql exactly.
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly PermissionName[]> = {
  owner: [
    'compliance.view',
    'compliance.manage',
    'compliance.export',
    'documents.view',
    'documents.upload',
    'documents.delete',
    'business.view',
    'business.update_profile',
    'business.verify',
    'team.view',
    'team.invite',
    'team.manage_roles',
    'team.remove',
    'marketplace.buy',
    'marketplace.sell',
    'marketplace.manage_rfq',
    'campaigns.create',
    'campaigns.collaborate',
    'campaigns.payout',
    'score.view',
    'score.share',
    'consents.view',
    'consents.grant',
    'consents.revoke',
    'audit.view',
  ],

  team_member: [
    'compliance.view',
    'compliance.manage',
    'documents.view',
    'documents.upload',
    'business.view',
    'score.view',
    'marketplace.buy',
  ],

  ca_partner: [
    'compliance.view',
    'compliance.manage',
    'compliance.export',
    'documents.view',
    'documents.upload',
    'business.view',
    'score.view',
    'audit.view',
  ],

  supplier: [
    'marketplace.sell',
    'marketplace.manage_rfq',
    'business.view',
    'business.verify',
    'compliance.view',
    'score.view',
    'documents.view',
    'documents.upload',
  ],

  influencer: [
    'campaigns.collaborate',
    'business.view',
    'business.verify',
    'documents.view',
    'documents.upload',
  ],

  lender: [
    'score.view',
    'business.view',
    'compliance.view',
  ],

  admin: [
    ...ALL_PERMISSIONS,
  ],
};
