import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { AuditService } from '../audit/service';
import type {
  CreatorProfile,
  CreatorCampaign,
  CampaignMilestone,
} from '@saarthi/shared-types';
import type {
  CreateCreatorProfileInput,
  CreateCampaignInput,
  SubmitMilestoneDeliverableInput,
} from '@saarthi/validation';

export class CreatorsService {
  /**
   * Evaluates caption / content for mandatory statutory ASCI disclosure tags.
   * Required under Consumer Protection Act 2019 and ASCI Influencer Guidelines.
   */
  static verifyASCIDisclosure(caption?: string | null): boolean {
    if (!caption) return false;
    const text = caption.toLowerCase();
    const asciKeywords = [
      '#ad',
      '#sponsored',
      '#paidpartnership',
      '#collaboration',
      '#promoted',
      '#advertisement',
      'ad',
      'sponsored',
      'paid promotion',
    ];
    return asciKeywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Lists verified vernacular creators with optional language / niche filters.
   */
  static async listCreators(
    language?: string,
    niche?: string
  ): Promise<CreatorProfile[]> {
    const supabase = await createClient();
    let query = supabase
      .from('creator_profiles')
      .select('*')
      .order('follower_count', { ascending: false });

    if (language && language !== 'ALL') {
      query = query.eq('primary_language', language);
    }
    if (niche && niche !== 'ALL') {
      query = query.eq('niche', niche);
    }

    const { data, error } = await query;
    if (error || !data) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      userId: d.user_id,
      businessId: d.business_id,
      displayName: d.display_name,
      handle: d.handle,
      platform: d.platform,
      primaryLanguage: d.primary_language,
      followerCount: d.follower_count,
      niche: d.niche,
      pan: d.pan,
      isVerified: d.is_verified,
      bio: d.bio,
      bioHi: d.bio_hi,
      rateCard: d.rate_card,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }

  /**
   * Creates a brand creator campaign and initializes milestone escrow.
   */
  static async createCampaign(
    userId: string,
    brandBusinessId: string,
    input: CreateCampaignInput
  ): Promise<CreatorCampaign> {
    const adminSupabase = createAdminClient();

    // 1. Create Campaign Record
    const { data: campaign, error: campError } = await adminSupabase
      .from('creator_campaigns')
      .insert({
        brand_business_id: brandBusinessId,
        title: input.title,
        description: input.description,
        budget: input.budget,
        platform: input.platform,
        target_language: input.targetLanguage,
        status: 'active',
        escrow_status: 'held_in_escrow',
      })
      .select()
      .single();

    if (campError || !campaign) {
      throw new Error(`Failed to create campaign: ${campError?.message}`);
    }

    // 2. Initialize Initial Milestone
    const { data: milestone, error: mileError } = await adminSupabase
      .from('campaign_milestones')
      .insert({
        campaign_id: campaign.id,
        creator_id: input.creatorId,
        title: `Deliverable 1: ${input.deliverableType.replace('_', ' ').toUpperCase()}`,
        deliverable_type: input.deliverableType,
        amount: input.budget,
        status: 'pending_submission',
      })
      .select()
      .single();

    if (mileError || !milestone) {
      throw new Error(`Failed to create milestone: ${mileError?.message}`);
    }

    await AuditService.record({
      businessId: brandBusinessId,
      actorId: userId,
      action: 'CREATOR_CAMPAIGN_CREATED',
      resourceType: 'creator_campaign',
      resourceId: campaign.id,
      details: {
        creatorId: input.creatorId,
        budget: input.budget,
      },
    });

    return {
      id: campaign.id,
      brandBusinessId: campaign.brand_business_id,
      title: campaign.title,
      description: campaign.description,
      budget: Number(campaign.budget),
      platform: campaign.platform,
      targetLanguage: campaign.target_language,
      status: campaign.status,
      escrowStatus: campaign.escrow_status,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
    };
  }

  /**
   * Lists campaigns for a brand business.
   */
  static async listCampaigns(businessId: string): Promise<CreatorCampaign[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('creator_campaigns')
      .select('*, campaign_milestones(*, creator_profiles(*))')
      .eq('brand_business_id', businessId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      brandBusinessId: d.brand_business_id,
      title: d.title,
      description: d.description,
      budget: Number(d.budget),
      platform: d.platform,
      targetLanguage: d.target_language,
      status: d.status,
      escrowStatus: d.escrow_status,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      milestones: (d.campaign_milestones || []).map((m: any) => ({
        id: m.id,
        campaignId: m.campaign_id,
        creatorId: m.creator_id,
        title: m.title,
        deliverableType: m.deliverable_type,
        amount: Number(m.amount),
        status: m.status,
        deliverableUrl: m.deliverable_url,
        asciDisclosureVerified: m.asci_disclosure_verified,
        notes: m.notes,
        submittedAt: m.submitted_at,
        releasedAt: m.released_at,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
        creator: m.creator_profiles
          ? {
              id: m.creator_profiles.id,
              displayName: m.creator_profiles.display_name,
              handle: m.creator_profiles.handle,
              platform: m.creator_profiles.platform,
              primaryLanguage: m.creator_profiles.primary_language,
              followerCount: m.creator_profiles.follower_count,
              niche: m.creator_profiles.niche,
              isVerified: m.creator_profiles.is_verified,
              rateCard: m.creator_profiles.rate_card,
              createdAt: m.creator_profiles.created_at,
              updatedAt: m.creator_profiles.updated_at,
            }
          : undefined,
      })),
    }));
  }

  /**
   * Creator submits deliverable URL + captions for automated ASCI statutory verification.
   */
  static async submitMilestoneDeliverable(
    userId: string,
    input: SubmitMilestoneDeliverableInput
  ): Promise<CampaignMilestone> {
    const adminSupabase = createAdminClient();
    const isAsciVerified = this.verifyASCIDisclosure(input.captionText || input.notes);
    const now = new Date().toISOString();

    const { data, error } = await adminSupabase
      .from('campaign_milestones')
      .update({
        deliverable_url: input.deliverableUrl,
        asci_disclosure_verified: isAsciVerified,
        notes: input.notes,
        status: 'submitted_for_review',
        submitted_at: now,
        updated_at: now,
      })
      .eq('id', input.milestoneId)
      .select('*, creator_profiles(*)')
      .single();

    if (error || !data) {
      throw new Error(`Failed to submit milestone: ${error?.message}`);
    }

    return {
      id: data.id,
      campaignId: data.campaign_id,
      creatorId: data.creator_id,
      title: data.title,
      deliverableType: data.deliverable_type,
      amount: Number(data.amount),
      status: data.status,
      deliverableUrl: data.deliverable_url,
      asciDisclosureVerified: data.asci_disclosure_verified,
      notes: data.notes,
      submittedAt: data.submitted_at,
      releasedAt: data.released_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Brand approves deliverable -> Releases milestone escrow payout to creator.
   */
  static async releaseMilestonePayout(
    userId: string,
    milestoneId: string
  ): Promise<CampaignMilestone> {
    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await adminSupabase
      .from('campaign_milestones')
      .update({
        status: 'approved_released',
        released_at: now,
        updated_at: now,
      })
      .eq('id', milestoneId)
      .select('*, creator_campaigns(*)')
      .single();

    if (error || !data) {
      throw new Error(`Failed to release milestone: ${error?.message}`);
    }

    // Update campaign escrow status to released
    await adminSupabase
      .from('creator_campaigns')
      .update({
        escrow_status: 'released_to_supplier',
        status: 'completed',
        updated_at: now,
      })
      .eq('id', data.campaign_id);

    await AuditService.record({
      businessId: data.creator_campaigns?.brand_business_id,
      actorId: userId,
      action: 'CAMPAIGN_ESCROW_PAYOUT_RELEASED',
      resourceType: 'campaign_milestone',
      resourceId: milestoneId,
      details: {
        amount: Number(data.amount),
        creatorId: data.creator_id,
      },
    });

    return {
      id: data.id,
      campaignId: data.campaign_id,
      creatorId: data.creator_id,
      title: data.title,
      deliverableType: data.deliverable_type,
      amount: Number(data.amount),
      status: data.status,
      deliverableUrl: data.deliverable_url,
      asciDisclosureVerified: data.asci_disclosure_verified,
      notes: data.notes,
      submittedAt: data.submitted_at,
      releasedAt: data.released_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
