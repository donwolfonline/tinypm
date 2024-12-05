// app/dashboard/domains/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Globe, Plus, ExternalLink, Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CustomDomain, DomainStatus, Subscription } from '@prisma/client';

export default function DomainsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeVerification, setActiveVerification] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add domain');
      }

      const domain = await response.json();
      setDomains(prev => [...prev, domain]);
      setNewDomain('');
      setActiveVerification(domain.id);
    } catch (error) {
      console.error('Error adding domain:', error);
      setError(error instanceof Error ? error.message : 'Failed to add domain');
    } finally {
      setIsAdding(false);
    }
  };

  const verifyDomain = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/domains/${id}/verify`, { method: 'POST' });
      if (!response.ok) throw new Error('Verification failed');
      
      const updatedDomain = await response.json();
      setDomains(prev => prev.map(d => d.id === id ? updatedDomain : d));
      
      if (updatedDomain.status === 'ACTIVE') {
        setActiveVerification(null);
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
    }
  }, []);

  const deleteDomain = async (id: string) => {
    if (!confirm('Are you sure you want to delete this domain?')) return;

    try {
      const response = await fetch(`/api/domains/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete domain');
      setDomains(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting domain:', error);
      setError('Failed to delete domain');
    }
  };

  const getDomainStatus = (status: DomainStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          text: 'Pending DNS Setup',
          color: 'text-yellow-500',
        };
      case 'DNS_VERIFICATION':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
          text: 'Verifying DNS...',
          color: 'text-blue-500',
        };
      case 'ACTIVE':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          text: 'Active',
          color: 'text-green-500',
        };
      case 'FAILED':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          text: 'Verification Failed',
          color: 'text-red-500',
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          text: 'Unknown Status',
          color: 'text-gray-500',
        };
    }
  };

  // Fetch existing domains and subscription
  useEffect(() => {
    const fetchData = async () => {
      if (status === 'loading') return;
      
      try {
        setIsLoading(true);
        const [domainsResponse, subscriptionResponse] = await Promise.all([
          fetch('/api/domains'),
          fetch('/api/subscription')
        ]);

        if (!domainsResponse.ok || !subscriptionResponse.ok) {
          throw new Error('Failed to fetch required data');
        }

        const [domainsData, subscriptionData] = await Promise.all([
          domainsResponse.json(),
          subscriptionResponse.json()
        ]);

        setDomains(domainsData.domains);
        setSubscription(subscriptionData.subscription);
        
        // Check subscription status only after we have the data
        if (subscriptionData.subscription?.status !== 'ACTIVE') {
          router.push('/dashboard?upgrade=true');
          return;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  // Handle authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const VERIFICATION_POLL_INTERVAL = 10000; // 10 seconds
    const MAX_ATTEMPTS = 30; // 5 minutes maximum polling time
    let attempts = 0;
    let intervalId: NodeJS.Timeout | null = null;
    
    async function pollDomainStatus() {
      if (!activeVerification) {
        return;
      }
  
      try {
        const domain = domains.find(d => d.id === activeVerification);
        
        // Check domain validity and verification status
        if (!domain || domain.status !== 'DNS_VERIFICATION' || attempts >= MAX_ATTEMPTS) {
          setActiveVerification(null);
          // Clear interval if we hit max attempts or invalid state
          if (intervalId) {
            clearInterval(intervalId);
          }
          return;
        }
  
        await verifyDomain(domain.id);
        attempts++;
  
        if (process.env.NODE_ENV === 'development') {
          console.log(`Verification attempt ${attempts}/${MAX_ATTEMPTS}`);
        }
      } catch (error) {
        console.error('Domain verification failed:', error);
        attempts++;
        
        if (attempts >= MAX_ATTEMPTS) {
          setActiveVerification(null);
          // Clear interval on max attempts
          if (intervalId) {
            clearInterval(intervalId);
          }
        }
      }
    }
  
    // Always set up the polling mechanism, but only execute if activeVerification exists
    pollDomainStatus(); // Initial check
    intervalId = setInterval(pollDomainStatus, VERIFICATION_POLL_INTERVAL);
  
    // Cleanup function always returns
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeVerification, domains, verifyDomain]);

  // Show loading state while checking subscription
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFCC00] flex items-center justify-center">
        <div className="flex items-center gap-2 bg-white rounded-lg p-4 shadow-lg">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }
  
  
  return (
    <div className="min-h-screen bg-[#FFCC00]">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm text-black/60 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Custom Domains</h1>
        </div>

        {subscription?.status !== 'ACTIVE' && (
          <div className="mx-auto max-w-4xl px-4">
            <div className="rounded-lg bg-yellow-100 p-4 text-yellow-800">
              <p>Custom domains require an active subscription.</p>
              <Link
                href="/dashboard?upgrade=true"
                className="mt-2 inline-block text-sm font-medium text-yellow-900 underline"
              >
                Upgrade your plan
              </Link>
            </div>
          </div>
        )}

        <div className="rounded-xl border-2 border-black bg-white p-6 shadow-lg">
          {/* Add Domain Form */}
          <form onSubmit={addDomain} className="mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                placeholder="Enter your domain (e.g., links.example.com)"
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2"
                disabled={isAdding}
              />
              <button
                type="submit"
                disabled={isAdding || !newDomain.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-[#FFCC00] disabled:opacity-50"
              >
                {isAdding ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                Add Domain
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </form>

          {/* Domains List */}
          <div className="space-y-4">
            {domains.map(domain => {
              const status = getDomainStatus(domain.status);
              return (
                <div
                  key={domain.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{domain.domain}</div>
                      <div className="flex items-center gap-2">
                        {status.icon}
                        <span className={`text-sm ${status.color}`}>{status.text}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {domain.status === 'ACTIVE' && (
                      <Link
                        href={`https://${domain.domain}`}
                        target="_blank"
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </Link>
                    )}
                    <button
                      onClick={() => deleteDomain(domain.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DNS Instructions */}
          {domains.some(d => d.status === 'PENDING' || d.status === 'DNS_VERIFICATION') && (
            <div className="mt-8 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 font-medium">DNS Configuration Instructions</h3>
              <p className="mb-4 text-sm text-gray-600">
                To connect your domain, add the following DNS record to your domain provider:
              </p>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200">
                      <td className="px-4 py-2 font-mono">CNAME</td>
                      <td className="px-4 py-2 font-mono">@</td>
                      <td className="px-4 py-2 font-mono">tiny.pm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                DNS changes can take up to 48 hours to propagate. We&apos;ll automatically check the
                configuration every few minutes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}