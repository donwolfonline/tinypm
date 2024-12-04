// components/dashboard/DomainSection.tsx
import { useState } from 'react';
import { Globe, Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { CustomDomain } from '@prisma/client';
import type { Subscription } from '@prisma/client';

interface DomainSectionProps {
  domains: CustomDomain[];
  subscription: Subscription | null;
}

export function DomainSection({ domains, subscription }: DomainSectionProps) {
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only allow domain management for premium users
  if (subscription?.status !== 'ACTIVE') {
    return null;
  }

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setError(null);

    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      // Refresh the page to show new domain
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add domain');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Custom Domains</h3>
      
      {/* Domain list */}
      {domains.length > 0 && (
        <div className="space-y-2">
          {domains.map(domain => (
            <div key={domain.id} className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{domain.domain}</span>
              </div>
              {domain.status === 'PENDING' ? (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying DNS...
                </div>
              ) : domain.status === 'ACTIVE' ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Active
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <XCircle className="h-4 w-4" />
                  Failed
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new domain form */}
      <form onSubmit={addDomain} className="space-y-2">
        <div>
          <input
            type="text"
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            placeholder="yourdomain.com"
            className="w-full rounded-lg border px-3 py-2"
            pattern="^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$"
            required
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={isAdding}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
          Add Domain
        </button>
      </form>
    </div>
  );
}