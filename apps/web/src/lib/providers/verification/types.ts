import type { VerificationRequest, VerificationResult } from '@saarthi/shared-types';

export interface VerificationProvider {
  name: string;
  isMock: boolean;
  verify(request: VerificationRequest): Promise<VerificationResult>;
}
