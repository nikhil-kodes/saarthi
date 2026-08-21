import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { AuditService } from '../audit/service';
import type {
  Business,
  ComplianceCategory,
  ComplianceInstance,
  ComplianceRequirement,
  ComplianceStatus,
  FilingRecord,
} from '@saarthi/shared-types';
import type {
  CreateFilingRecordInput,
  ListComplianceInstancesQueryInput,
  UpdateComplianceInstanceInput,
} from '@saarthi/validation';

export class ComplianceService {
  /**
   * Evaluates if a given regulatory requirement applies to a business profile.
   */
  static evaluateApplicability(
    business: Business,
    requirement: ComplianceRequirement
  ): boolean {
    const rules = requirement.applicabilityRules || {};

    // 1. State Jurisdiction Check
    if (requirement.jurisdictionState && requirement.jurisdictionState !== business.jurisdictionState) {
      return false;
    }

    // 2. GSTIN Requirement Check
    if (rules.has_gstin === true && !business.gstin) {
      return false;
    }

    // 3. Udyam Registration Check
    if (rules.has_udyam === true && !business.udyamNumber) {
      return false;
    }

    // 4. Sector Check
    if (rules.sector && rules.sector !== business.sector) {
      return false;
    }
    if (Array.isArray(rules.sectors) && !rules.sectors.includes(business.sector)) {
      return false;
    }

    // 5. Employee Count Threshold Check (e.g. EPF min 20 employees)
    if (typeof rules.min_employees === 'number') {
      const band = business.employeeCountBand || '1-9';
      if (band === '1-9' || (band === '10-19' && rules.min_employees > 19)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Materializes scheduled compliance instances for an entity for a given calendar year.
   */
  static async generateInstancesForBusiness(
    businessId: string,
    year: number = new Date().getFullYear()
  ): Promise<number> {
    const adminSupabase = createAdminClient();

    // 1. Fetch business
    const { data: businessData, error: bizError } = await adminSupabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (bizError || !businessData) {
      throw new Error(`Business not found: ${bizError?.message}`);
    }

    const business: Business = {
      id: businessData.id,
      legalName: businessData.legal_name,
      tradeName: businessData.trade_name,
      sector: businessData.sector,
      jurisdictionCountry: businessData.jurisdiction_country,
      jurisdictionState: businessData.jurisdiction_state,
      employeeCountBand: businessData.employee_count_band,
      turnoverBand: businessData.turnover_band,
      investmentBand: businessData.investment_band,
      gstin: businessData.gstin,
      udyamNumber: businessData.udyam_number,
      fssaiNumber: businessData.fssai_number,
      pan: businessData.pan,
      isVerified: businessData.is_verified,
      createdAt: businessData.created_at,
      updatedAt: businessData.updated_at,
    };

    // 2. Fetch all requirements
    const { data: requirements, error: reqError } = await adminSupabase
      .from('compliance_requirements')
      .select('*');

    if (reqError || !requirements) {
      throw new Error(`Failed to load requirements: ${reqError?.message}`);
    }

    const instancesToInsert: any[] = [];
    const now = new Date();

    for (const req of requirements) {
      const requirement: ComplianceRequirement = {
        id: req.id,
        code: req.code,
        title: req.title,
        titleHi: req.title_hi,
        description: req.description,
        descriptionHi: req.description_hi,
        category: req.category,
        actName: req.act_name,
        jurisdictionCountry: req.jurisdiction_country,
        jurisdictionState: req.jurisdiction_state,
        applicabilityRules: req.applicability_rules,
        frequency: req.frequency,
        dueDayOffset: req.due_day_offset,
        penaltyDetails: req.penalty_details,
        penaltyDetailsHi: req.penalty_details_hi,
        createdAt: req.created_at,
        updatedAt: req.updated_at,
      };

      if (!this.evaluateApplicability(business, requirement)) {
        continue;
      }

      // Generate based on frequency
      if (req.frequency === 'monthly') {
        for (let m = 0; m < 12; m++) {
          const pStart = new Date(year, m, 1);
          const pEnd = new Date(year, m + 1, 0); // Last day of month
          const dueDate = new Date(year, m + 1, req.due_day_offset);

          const status: ComplianceStatus =
            dueDate < now ? 'overdue' : 'due_soon';

          instancesToInsert.push({
            business_id: businessId,
            requirement_id: req.id,
            status,
            due_date: dueDate.toISOString().slice(0, 10),
            period_start: pStart.toISOString().slice(0, 10),
            period_end: pEnd.toISOString().slice(0, 10),
          });
        }
      } else if (req.frequency === 'quarterly') {
        const quarters = [
          { pStart: `${year}-04-01`, pEnd: `${year}-06-30`, dueMonth: 6, dueDay: req.due_day_offset },
          { pStart: `${year}-07-01`, pEnd: `${year}-09-30`, dueMonth: 9, dueDay: req.due_day_offset },
          { pStart: `${year}-10-01`, pEnd: `${year}-12-31`, dueMonth: 0, dueYear: year + 1, dueDay: req.due_day_offset },
          { pStart: `${year + 1}-01-01`, pEnd: `${year + 1}-03-31`, dueMonth: 3, dueYear: year + 1, dueDay: req.due_day_offset },
        ];

        for (const q of quarters) {
          const dYear = q.dueYear || year;
          const dueDate = new Date(dYear, q.dueMonth, q.dueDay);
          const status: ComplianceStatus = dueDate < now ? 'overdue' : 'due_soon';

          instancesToInsert.push({
            business_id: businessId,
            requirement_id: req.id,
            status,
            due_date: dueDate.toISOString().slice(0, 10),
            period_start: q.pStart,
            period_end: q.pEnd,
          });
        }
      } else if (req.frequency === 'annual') {
        const pStart = `${year}-04-01`;
        const pEnd = `${year + 1}-03-31`;
        // For annual returns, due date is calculated based on offset
        const dueDate = new Date(year, 11, req.due_day_offset || 31);
        const status: ComplianceStatus = dueDate < now ? 'overdue' : 'due_soon';

        instancesToInsert.push({
          business_id: businessId,
          requirement_id: req.id,
          status,
          due_date: dueDate.toISOString().slice(0, 10),
          period_start: pStart,
          period_end: pEnd,
        });
      }
    }

    if (instancesToInsert.length === 0) {
      return 0;
    }

    const { data: inserted, error: insertError } = await adminSupabase
      .from('business_compliance_instances')
      .upsert(instancesToInsert, {
        onConflict: 'business_id,requirement_id,period_start,period_end',
        ignoreDuplicates: true,
      })
      .select('id');

    if (insertError) {
      console.warn('Upsert notice on compliance instances:', insertError.message);
    }

    return inserted?.length || instancesToInsert.length;
  }

  /**
   * Queries compliance instances for a business with optional filtering.
   */
  static async listBusinessInstances(
    businessId: string,
    filters?: ListComplianceInstancesQueryInput
  ): Promise<ComplianceInstance[]> {
    const supabase = await createClient();

    let query = supabase
      .from('business_compliance_instances')
      .select('*, compliance_requirements(*), compliance_filing_records(*)')
      .eq('business_id', businessId)
      .order('due_date', { ascending: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.fromDate) {
      query = query.gte('due_date', filters.fromDate);
    }

    if (filters?.toDate) {
      query = query.lte('due_date', filters.toDate);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    const now = new Date().toISOString().slice(0, 10);

    return data
      .filter((row: any) => {
        if (filters?.category && row.compliance_requirements?.category !== filters.category) {
          return false;
        }
        return true;
      })
      .map((row: any) => {
        let status: ComplianceStatus = row.status;
        if (status === 'due_soon' && row.due_date < now) {
          status = 'overdue';
        }

        const filing = row.compliance_filing_records?.[0];

        return {
          id: row.id,
          businessId: row.business_id,
          requirementId: row.requirement_id,
          status,
          dueDate: row.due_date,
          periodStart: row.period_start,
          periodEnd: row.period_end,
          notes: row.notes,
          metadata: row.metadata,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          requirement: row.compliance_requirements
            ? {
                id: row.compliance_requirements.id,
                code: row.compliance_requirements.code,
                title: row.compliance_requirements.title,
                titleHi: row.compliance_requirements.title_hi,
                description: row.compliance_requirements.description,
                descriptionHi: row.compliance_requirements.description_hi,
                category: row.compliance_requirements.category,
                actName: row.compliance_requirements.act_name,
                jurisdictionCountry: row.compliance_requirements.jurisdiction_country,
                jurisdictionState: row.compliance_requirements.jurisdiction_state,
                applicabilityRules: row.compliance_requirements.applicability_rules,
                frequency: row.compliance_requirements.frequency,
                dueDayOffset: row.compliance_requirements.due_day_offset,
                penaltyDetails: row.compliance_requirements.penalty_details,
                penaltyDetailsHi: row.compliance_requirements.penalty_details_hi,
                createdAt: row.compliance_requirements.created_at,
                updatedAt: row.compliance_requirements.updated_at,
              }
            : undefined,
          filingRecord: filing
            ? {
                id: filing.id,
                instanceId: filing.instance_id,
                businessId: filing.business_id,
                filedBy: filing.filed_by,
                filedAt: filing.filed_at,
                acknowledgementNumber: filing.acknowledgement_number,
                documentUrl: filing.document_url,
                notes: filing.notes,
                createdAt: filing.created_at,
              }
            : undefined,
        };
      });
  }

  /**
   * Records a compliance filing, transitions instance status to 'compliant', and audits event.
   */
  static async recordFiling(
    userId: string,
    instanceId: string,
    input: CreateFilingRecordInput
  ): Promise<FilingRecord> {
    const adminSupabase = createAdminClient();

    // 1. Fetch instance
    const { data: instance, error: instError } = await adminSupabase
      .from('business_compliance_instances')
      .select('*, compliance_requirements(*)')
      .eq('id', instanceId)
      .single();

    if (instError || !instance) {
      throw new Error(`Compliance instance not found: ${instError?.message}`);
    }

    // 2. Insert Filing Record
    const { data: filing, error: filingError } = await adminSupabase
      .from('compliance_filing_records')
      .insert({
        instance_id: instanceId,
        business_id: instance.business_id,
        filed_by: userId,
        acknowledgement_number: input.acknowledgementNumber || null,
        document_url: input.documentUrl || null,
        notes: input.notes || null,
      })
      .select()
      .single();

    if (filingError || !filing) {
      throw new Error(`Failed to record filing: ${filingError?.message}`);
    }

    // 3. Transition instance status to 'compliant'
    await adminSupabase
      .from('business_compliance_instances')
      .update({
        status: 'compliant',
        updated_at: new Date().toISOString(),
      })
      .eq('id', instanceId);

    // 4. Record Audit Trail
    await AuditService.record({
      businessId: instance.business_id,
      actorId: userId,
      action: 'COMPLIANCE_FILING_RECORDED',
      resourceType: 'compliance_instance',
      resourceId: instanceId,
      details: {
        requirementCode: instance.compliance_requirements?.code,
        acknowledgementNumber: input.acknowledgementNumber,
        dueDate: instance.due_date,
      },
    });

    return {
      id: filing.id,
      instanceId: filing.instance_id,
      businessId: filing.business_id,
      filedBy: filing.filed_by,
      filedAt: filing.filed_at,
      acknowledgementNumber: filing.acknowledgement_number,
      documentUrl: filing.document_url,
      notes: filing.notes,
      createdAt: filing.created_at,
    };
  }
}
