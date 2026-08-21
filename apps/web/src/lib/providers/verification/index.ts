import type { VerificationProvider } from './types';
import { MockVerificationProvider } from './mock-provider';

export * from './types';
export * from './mock-provider';

/**
 * Resolves the active VerificationProvider instance.
 * Default for MVP/Hackathon: MockVerificationProvider.
 */
export function getVerificationProvider(): VerificationProvider {
  // Future DigiLocker/ApiSetu provider can be plugged here
  return new MockVerificationProvider();
}
