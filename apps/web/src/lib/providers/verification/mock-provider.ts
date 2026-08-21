import type {
  VerificationCheck,
  VerificationRequest,
  VerificationResult,
} from '@saarthi/shared-types';
import type { VerificationProvider } from './types';

export class MockVerificationProvider implements VerificationProvider {
  readonly name = 'MockVerificationProvider';
  readonly isMock = true;

  async verify(request: VerificationRequest): Promise<VerificationResult> {
    const checks: VerificationCheck[] = [];
    const timestamp = new Date().toISOString();

    // 1. Check PAN
    if (request.pan) {
      checks.push({
        type: 'pan',
        identifier: request.pan,
        status: 'verified',
        verifiedAt: timestamp,
        message: 'PAN verified against simulated NSDL/Income Tax database.',
        details: {
          taxpayerName: request.legalName,
          status: 'Active',
          category: 'Company/Proprietorship',
        },
      });
    }

    // 2. Check GSTIN
    if (request.gstin) {
      checks.push({
        type: 'gstin',
        identifier: request.gstin,
        status: 'verified',
        verifiedAt: timestamp,
        message: 'GSTIN verified against simulated GSTN portal.',
        details: {
          legalName: request.legalName,
          state: request.jurisdictionState,
          taxpayerType: 'Regular',
          status: 'Active',
        },
      });
    }

    // 3. Check Udyam Registration
    if (request.udyamNumber) {
      checks.push({
        type: 'udyam',
        identifier: request.udyamNumber,
        status: 'verified',
        verifiedAt: timestamp,
        message: 'Udyam MSME certificate verified against simulated MSME Ministry registry.',
        details: {
          enterpriseType: 'Micro/Small Enterprise',
          majorActivity: request.sector,
          status: 'Verified',
        },
      });
    }

    // 4. Check FSSAI (if food sector or provided)
    if (request.fssaiNumber) {
      checks.push({
        type: 'fssai',
        identifier: request.fssaiNumber,
        status: 'verified',
        verifiedAt: timestamp,
        message: 'FSSAI Food Safety Licence verified against simulated FoSCoS registry.',
        details: {
          licenseCategory: 'State License',
          status: 'Active',
        },
      });
    }

    // If at least one official credential was verified, overall status is verified
    const hasVerifiedCheck = checks.some((c) => c.status === 'verified');

    if (hasVerifiedCheck) {
      return {
        status: 'verified',
        provider: this.name,
        checks,
        verifiedAt: timestamp,
        isMock: true,
      };
    }

    // If no numbers were supplied, return unverified state with guidance
    return {
      status: 'unverified',
      provider: this.name,
      checks: [
        {
          type: 'registry',
          identifier: request.legalName,
          status: 'skipped',
          verifiedAt: timestamp,
          message: 'No official registration identifiers (GSTIN, Udyam, PAN) were provided for automated verification.',
        },
      ],
      verifiedAt: timestamp,
      failureReason: 'No verifiable registration numbers provided.',
      isMock: true,
    };
  }
}
