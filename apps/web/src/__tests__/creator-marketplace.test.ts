import { describe, it, expect } from 'vitest';
import {
  createCreatorProfileSchema,
  createCampaignSchema,
  submitMilestoneDeliverableSchema,
} from '@saarthi/validation';
import { CreatorsService } from '../lib/services/creators';

describe('Creator Marketplace & ASCI Statutory Compliance', () => {
  it('should validate vernacular creator profile schema', () => {
    const valid = createCreatorProfileSchema.safeParse({
      displayName: 'UP Kisan Vlogs',
      handle: '@up_kisan',
      platform: 'youtube',
      primaryLanguage: 'hi',
      followerCount: 250000,
      niche: 'agritech',
      pan: 'ABCDE1234F',
      bio: 'Modern agriculture and equipment review.',
      rateCard: { reel_video: 5000, dedicated_video: 15000 },
    });
    expect(valid.success).toBe(true);
  });

  it('should validate brand campaign creation schema', () => {
    const valid = createCampaignSchema.safeParse({
      brandBusinessId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Festive Mustard Oil Campaign',
      description: 'Promote cold-pressed mustard oil in Eastern UP.',
      budget: 15000,
      platform: 'youtube',
      targetLanguage: 'bho',
      creatorId: '223e4567-e89b-12d3-a456-426614174000',
      deliverableType: 'dedicated_video',
    });
    expect(valid.success).toBe(true);
  });

  it('should verify ASCI statutory disclosure hashtags in content', () => {
    expect(
      CreatorsService.verifyASCIDisclosure(
        'Check out this great pure mustard oil from Sharma Foods! #Ad #PurvanchalEats'
      )
    ).toBe(true);

    expect(
      CreatorsService.verifyASCIDisclosure(
        'Honest review in paid partnership with local dairy brand #Sponsored #Collaboration'
      )
    ).toBe(true);

    expect(
      CreatorsService.verifyASCIDisclosure(
        'Just visited this local food festival in Lucknow, amazing taste!'
      )
    ).toBe(false);
  });

  it('should validate milestone deliverable URL submission', () => {
    const valid = submitMilestoneDeliverableSchema.safeParse({
      milestoneId: '123e4567-e89b-12d3-a456-426614174000',
      deliverableUrl: 'https://youtube.com/watch?v=sample123',
      captionText: 'Product review of Sharma Sweets #Ad #PaidPartnership',
      notes: 'Video published at 6 PM IST.',
    });
    expect(valid.success).toBe(true);
  });
});
