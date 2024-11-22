// components/dashboard/SaveStatusIndicator.tsx
import { Save } from 'lucide-react';

interface SaveStatusIndicatorProps {
  status: 'idle' | 'pending' | 'saving' | 'saved' | 'error';
  errorMessage?: string;
}

export function SaveStatusIndicator({ status, errorMessage }: SaveStatusIndicatorProps) {
  if (status === 'idle') return null;

  const statusStyles = {
    pending: 'bg-yellow-500',
    saving: 'bg-blue-500',
    saved: 'bg-green-500',
    error: 'bg-red-500',
  };

  const statusMessages = {
    pending: 'Changes pending...',
    saving: 'Saving...',
    saved: 'Saved!',
    error: errorMessage || 'Error saving',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-lg transition-all duration-200 ${statusStyles[status]}`}
    >
      {status === 'saving' && (
        <div className="animate-spin">
          <Save className="h-4 w-4" />
        </div>
      )}
      {status === 'saved' && <Save className="h-4 w-4" />}
      <span>{statusMessages[status]}</span>
    </div>
  );
}
