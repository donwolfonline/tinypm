// lib/domainVerification.ts
type VerificationResponse = {
    status: 'ACTIVE' | 'FAILED' | 'PENDING' | 'DNS_VERIFICATION';
    error?: string;
  };
  
  export async function verifyDomain(domainId: string): Promise<VerificationResponse> {
    console.log(`[Domain Verification] Initiating verification for domain: ${domainId}`);
    
    try {
      const response = await fetch(`/api/domains/${domainId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[Domain Verification] Failed:', data);
        throw new Error(data.error || 'Verification failed');
      }
  
      console.log('[Domain Verification] Success:', data);
      return data;
    } catch (error) {
      console.error('[Domain Verification] Error:', error);
      throw error;
    }
  }