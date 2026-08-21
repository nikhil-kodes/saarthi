import { describe, it, expect } from 'vitest';
import {
  createTeamInviteSchema,
  acceptTeamInviteSchema,
} from '@saarthi/validation';

describe('Team Invite Validation & Role Delegation', () => {
  it('should validate valid team invite payload for CA partner', () => {
    const payload = {
      businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      email: 'ca.sharma@auditfirm.in',
      roleName: 'ca_partner',
    };
    const parsed = createTeamInviteSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it('should validate valid team invite payload for operational team member', () => {
    const payload = {
      businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      email: 'manager@sharmafoods.in',
      roleName: 'team_member',
    };
    const parsed = createTeamInviteSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid role in team invite', () => {
    const invalid = {
      businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      email: 'hacker@sharmafoods.in',
      roleName: 'invalid_superadmin',
    };
    expect(createTeamInviteSchema.safeParse(invalid).success).toBe(false);
  });

  it('should reject invalid or short invite tokens in accept payload', () => {
    expect(acceptTeamInviteSchema.safeParse({ token: 'short' }).success).toBe(false);
    expect(
      acceptTeamInviteSchema.safeParse({
        token: '4a6b2c8d1e3f5a7b9c0d2e4f6a8b0c2d',
      }).success
    ).toBe(true);
  });
});
