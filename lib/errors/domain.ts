// lib/errors/domain.ts
/**
 * Custom error class for domain-related operations
 * Extends Error to maintain stack traces while adding specific error codes
 */
export class DomainVerificationError extends Error {
    constructor(
      message: string,
      public code: 
        | 'INVALID_DOMAIN'
        | 'DNS_ERROR'
        | 'VERIFICATION_FAILED'
        | 'RATE_LIMITED'
        | 'MAX_ATTEMPTS_EXCEEDED'
        | 'SUBSCRIPTION_REQUIRED'
    ) {
      super(message);
      this.name = 'DomainVerificationError';
      // Ensures proper inheritance in TypeScript
      Object.setPrototypeOf(this, DomainVerificationError.prototype);
    }
  }
  
  // Type guard to check if an error is a DomainVerificationError
  export function isDomainVerificationError(
    error: unknown
  ): error is DomainVerificationError {
    return error instanceof DomainVerificationError;
  }