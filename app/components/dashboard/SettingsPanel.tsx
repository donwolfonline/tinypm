// components/dashboard/SettingsPanel.tsx
import { X, LogOut, XCircle, User, Globe, ChevronRight } from 'lucide-react';
import { Theme } from '@/types';
import { themes } from '@/lib/themes';
import ThemeSelector from './ThemeSelector';
import { Session } from 'next-auth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProxiedImage } from '../ProxiedImage';
import { SubscriptionSection } from './SubscriptionSection';
import type { Subscription } from '@prisma/client';

interface PendingChanges {
  name?: string;
  image?: string;
  pageTitle?: string;
  pageDesc?: string;
  theme?: Theme;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  currentTheme: Theme;
  setCurrentTheme: (theme: Theme) => void;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  onSignOut: () => void;
  pageTitle: string;
  pageDesc: string;
  onPageTitleChange: (title: string) => void;
  onPageDescChange: (desc: string) => void;
  displayPicture: string;
  onDisplayPictureChange: (image: string) => void;
  updateSession: () => Promise<Session | null>;
  setSaveStatus: (status: 'idle' | 'pending' | 'saving' | 'saved' | 'error') => void;
  setErrorMessage: (message: string) => void;
  subscription: Subscription | null;
}

export function SettingsPanel({
  isOpen,
  onClose,
  session,
  currentTheme,
  setCurrentTheme,
  displayName,
  onDisplayNameChange,
  onSignOut,
  pageTitle,
  pageDesc,
  onPageTitleChange,
  onPageDescChange,
  displayPicture,
  onDisplayPictureChange,
  updateSession,
  setSaveStatus,
  setErrorMessage,
  subscription,
}: SettingsPanelProps) {
  const themeConfig = themes[currentTheme];
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});
  const [localTheme, setLocalTheme] = useState(currentTheme);
  const [localTitle, setLocalTitle] = useState(pageTitle || '');
  const [localDesc, setLocalDesc] = useState(pageDesc || '');
  const [localName, setLocalName] = useState(displayName);
  const [localImage, setLocalImage] = useState(displayPicture || '');
  const [imageError, setImageError] = useState(false);

  const isActiveSubscription =
    subscription &&
    subscription.status === 'ACTIVE' &&
    new Date(subscription.currentPeriodEnd) > new Date();

  // Update local stateother fields
  useEffect(() => {
    setLocalTitle(pageTitle || '');
    setLocalDesc(pageDesc || '');
    setLocalName(displayName);
    setLocalImage(displayPicture || '');
  }, [pageTitle, pageDesc, displayName, displayPicture]);

  const handleLocalChange = (field: keyof PendingChanges, value: string) => {
    // For image field, empty string is valid (will be converted to null in API)
    if (field === 'image' || value.trim() || field === 'pageTitle' || field === 'pageDesc') {
      setPendingChanges(prev => ({ ...prev, [field]: value }));
    }

    switch (field) {
      case 'pageTitle':
        setLocalTitle(value);
        onPageTitleChange(value);
        break;
      case 'pageDesc':
        setLocalDesc(value);
        onPageDescChange(value);
        break;
      case 'name':
        setLocalName(value);
        onDisplayNameChange(value);
        break;
      case 'image':
        setLocalImage(value);
        onDisplayPictureChange(value);
        setImageError(false);
        break;
    }
  };

  const saveChanges = async () => {
    if (Object.keys(pendingChanges).length > 0) {
      try {
        setSaveStatus('saving');
        const response = await fetch('/api/user', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pendingChanges),
        });

        if (!response.ok) {
          throw new Error('Failed to save changes');
        }

        await updateSession();
        setSaveStatus('saved');
        setPendingChanges({});
      } catch (error) {
        console.error('Error saving changes:', error);
        setSaveStatus('error');
        setErrorMessage('Failed to save changes');
      }
    }
  };

  const handleClose = () => {
    onClose();
    if (Object.keys(pendingChanges).length > 0) {
      saveChanges();
    }
  };

  // Handle theme changes separately since they're immediate
  const handleLocalThemeChange = async (theme: Theme) => {
    setLocalTheme(theme);
    setCurrentTheme(theme);
    setPendingChanges(prev => ({ ...prev, theme }));

    try {
      setSaveStatus('saving');
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        throw new Error('Failed to save theme');
      }

      await updateSession();
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving theme:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to save theme');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      onClick={e => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className={`absolute right-0 h-full w-full bg-white p-6 sm:w-96 ${themeConfig.buttonBorder}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold">Settings</h2>
            <button onClick={handleClose} className="rounded-lg p-2 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto py-6">
            {/* User Info */}
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              {localImage ? (
                <ProxiedImage
                  src={localImage}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="h-16 w-16 overflow-hidden rounded-full border-2 border-gray-200"
                  fallbackImage="/images/goose.svg"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200">
                  {localName ? (
                    <span className="text-xl font-medium text-gray-700">
                      {localName[0]?.toUpperCase()}
                    </span>
                  ) : (
                    <User className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              )}
              <div>
                <div className="font-medium">{displayName}</div>
                <div className="text-sm text-gray-500">{session?.user?.email}</div>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <h3 className="mb-2 font-medium">Display Name</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localName}
                  onChange={e => handleLocalChange('name', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="Your display name"
                  style={{
                    fontSize: '16px', // Base size to prevent zoom
                    transform: 'scale(0.875)', // Scale down visually
                    transformOrigin: 'left center',
                  }}
                />
              </div>
            </div>

            {/* Profile Picture */}
            <div className="relative flex-1">
              <h3 className="mb-2 font-medium">Profile Picture</h3>
              <div className="relative flex items-center">
                <input
                  type="url"
                  value={localImage}
                  onChange={e => {
                    setImageError(false); // Reset error state when input changes
                    handleLocalChange('image', e.target.value);
                  }}
                  className={`w-full rounded-lg border ${
                    imageError ? 'border-red-300' : 'border-gray-200'
                  } px-3 py-2 pr-10`}
                  placeholder="Enter image URL (https://...)"
                  style={{
                    fontSize: '16px', // Base size to prevent zoom
                    transform: 'scale(0.875)', // Scale down visually
                    transformOrigin: 'left center',
                  }}
                />
                {localImage && (
                  <button
                    onClick={() => {
                      handleLocalChange('image', '');
                      setImageError(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
                    title="Clear image URL"
                  >
                    <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              {imageError ? (
                <p className="mt-1 text-xs text-red-500">
                  Unable to load image. Please check the URL and try again.
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Enter the URL of your profile picture (must be a public image URL)
                </p>
              )}
            </div>

            {/* Page Metadata */}
            <div>
              <h3 className="mb-2 font-medium">Page Metadata</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Page Title</label>
                  <input
                    type="text"
                    value={localTitle}
                    onChange={e => handleLocalChange('pageTitle', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="Custom page title (optional)"
                    style={{
                      fontSize: '16px', // Base size to prevent zoom
                      transform: 'scale(0.875)', // Scale down visually
                      transformOrigin: 'left center',
                    }}
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave blank to use default</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Page Description</label>
                  <textarea
                    value={localDesc}
                    onChange={e => handleLocalChange('pageDesc', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="Custom page description (optional)"
                    rows={3}
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave blank to use default</p>
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <ThemeSelector currentTheme={localTheme} onThemeChange={handleLocalThemeChange} />

            <SubscriptionSection subscription={subscription} />

            {isActiveSubscription ? (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="mb-4 font-medium">Custom Domain</h3>
                <Link
                  href="/dashboard/domains"
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Globe className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">Manage Custom Domain</div>
                      <div className="text-sm text-gray-500">
                        Connect your own domain to your profile
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="mb-4 font-medium">Custom Domain</h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-200 p-2">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Custom Domains</div>
                      <div className="text-sm text-gray-500">Available with Pro plan</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-2 font-medium text-red-600">Danger Zone</h3>
              <button className="mb-3 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-600 hover:bg-red-100">
                Delete Account
              </button>

              <button
                onClick={onSignOut}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
