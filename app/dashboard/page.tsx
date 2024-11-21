'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, GripVertical, ExternalLink, Settings, X, LogOut, Save } from 'lucide-react';
import debounce from 'lodash/debounce';
import type { Link as LinkType } from '@/types';
import Link from 'next/link';
import ThemeSelector from './ThemeSelector';
import type { Theme } from '@/types';
import { themes, getThemeStyles } from '@/lib/themes';
import LoadingSpinner from '@/app/components/LoadingSpinner';

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export default function DashboardPage() {
  const { data: session, update: updateSession, status } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<Theme>('YELLOW');
  const themeConfig = themes[currentTheme];

  const [pageTitle, setPageTitle] = useState(session?.user?.pageTitle || '');
  const [pageDesc, setPageDesc] = useState(session?.user?.pageDesc || '');

  const router = useRouter();
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const unsavedChangesRef = useRef<boolean>(false);
  const [displayName, setDisplayName] = useState(session?.user?.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Create a debounced save function with proper type definition
  const debouncedSaveRef = useRef(
    debounce(async (linksToSave: LinkType[]) => {
      try {
        setSaveStatus('saving');
        await Promise.all(
          linksToSave.map(async link => {
            await fetch(`/api/links/${link.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(link),
            });
          })
        );
        setSaveStatus('saved');
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('Error saving changes:', error);
        setSaveStatus('error');
        setErrorMessage('Failed to save changes');
      }
    }, 1500)
  );

  const handleMetadataSave = async () => {
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageTitle, pageDesc }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update metadata');
      }
  
      await updateSession();
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error updating metadata:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to update metadata');
    }
  };

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links');
      const data = await response.json();
      if (data.links) {
        setLinks(data.links);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      // First set isLoading to false
      setIsLoading(false);
      // Then wait for animation to complete before removing loading component
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }
  };

  // Handle changes to links
  const handleLinksChange = useCallback(
    (newLinks: LinkType[]) => {
      setLinks(newLinks);
      setSaveStatus('pending');
      unsavedChangesRef.current = true;
      debouncedSaveRef.current(newLinks);
    },
    [setSaveStatus]
  );

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newLinks = Array.from(links);
    const [movedItem] = newLinks.splice(result.source.index, 1);
    newLinks.splice(result.destination.index, 0, movedItem);

    // Update order for all affected links
    const updatedLinks = newLinks.map((link, index) => ({
      ...link,
      order: index,
    }));

    handleLinksChange(updatedLinks);
  };

  const handleThemeChange = async (newTheme: Theme) => {
    try {
      setSaveStatus('saving');
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      });

      if (!response.ok) {
        throw new Error('Failed to update theme');
      }

      setCurrentTheme(newTheme);
      await updateSession();
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error updating theme:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to update theme');
    }
  };

  const addNewLink = async () => {
    try {
      console.log('Adding new link...');
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          title: '',
          url: '',
          enabled: true,
          order: links.length,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to add link: ${response.statusText}`);
      }

      const newLink = await response.json();
      console.log('New link created:', newLink);
      handleLinksChange([...links, newLink]);
    } catch (error) {
      console.error('Error adding new link:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to add new link');
    }
  };

  const updateLink = (id: string, field: keyof LinkType, value: string | boolean) => {
    const updatedLinks = links.map(link => (link.id === id ? { ...link, [field]: value } : link));
    handleLinksChange(updatedLinks);
  };

  const deleteLink = async (id: string) => {
    try {
      await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      });
      handleLinksChange(links.filter(link => link.id !== id));
    } catch (error) {
      console.error('Error deleting link:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to delete link');
    }
  };

  const handleDisplayNameChange = async (newName: string) => {
    setDisplayName(newName);
  };

  const handleDisplayNameSave = async () => {
    if (isUpdatingName || displayName === session?.user?.name) return;

    setIsUpdatingName(true);
    setSaveStatus('saving');

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update display name');
      }

      // Update the session
      await updateSession();
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error updating display name:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to update display name');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleSignOut = async () => {
    // Ensure any pending changes are saved before signing out
    if (unsavedChangesRef.current) {
      await debouncedSaveRef.current.flush();
    }
    await signOut({ callbackUrl: '/' });
  };

  // Add this component for the save status indicator
  const SaveStatusIndicator = () => {
    if (saveStatus === 'idle') return null;

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
        className={`fixed bottom-4 right-4 flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-lg transition-all duration-200 ${statusStyles[saveStatus]}`}
      >
        {saveStatus === 'saving' && (
          <div className="animate-spin">
            <Save className="h-4 w-4" />
          </div>
        )}
        {saveStatus === 'saved' && <Save className="h-4 w-4" />}
        <span>{statusMessages[saveStatus]}</span>
      </div>
    );
  };

  // Save before closing/navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChangesRef.current) {
        e.preventDefault();
        return (e.returnValue = 'You have unsaved changes. Are you sure you want to leave?');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.id) {
      fetchLinks();
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.theme) {
      // Add a tiny delay to the theme change to make it smoother
      const timer = setTimeout(() => {
        setCurrentTheme(session.user.theme as Theme);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [session?.user?.theme]);

  useEffect(() => {
    const fetchUserTheme = async () => {
      try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        if (userData.theme) {
          setCurrentTheme(userData.theme as Theme);
        }
      } catch (error) {
        console.error('Error fetching user theme:', error);
      }
    };

    fetchUserTheme();
  }, []); // Run once on mount

  // Cleanup effect for unsaved changes
  useEffect(() => {
    const currentDebouncedSave = debouncedSaveRef.current;
    return () => {
      // Use the stored reference in cleanup
      if (unsavedChangesRef.current) {
        currentDebouncedSave.flush();
      }
    };
  }, []);

  return (
    <>
      {(isLoading || isTransitioning) && (
        <div className="transition-colors duration-300 ease-in-out">
          <LoadingSpinner theme={currentTheme} />
        </div>
      )}
      <div
        className={`min-h-screen transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={getThemeStyles(currentTheme)}
      >
        {/* Navigation */}
        <nav
          className="fixed top-0 z-50 w-full border-b border-black"
          style={getThemeStyles(currentTheme, 'solid')} // Add 'solid' variant here
        >
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
            <div className={`flex items-center gap-2 ${themeConfig.text}`}>
              <Image src="/images/goose.svg" alt="TinyPM Logo" width={64} height={64} />
              <span className="text-xl font-bold">tiny.pm</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`rounded-lg p-2 transition-colors duration-200 ${themeConfig.text} hover:bg-black/10`}
            >
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mx-auto max-w-2xl px-4 pt-24">
          {/* Preview URL Banner */}
          <div className={`mb-8 rounded-lg bg-white/80 p-4 shadow-sm ${themeConfig.buttonBorder}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔥 Your page is live at:</span>
                <code className="rounded bg-black/5 px-2 py-1 text-sm">
                  tiny.pm/{session?.user?.username}
                </code>
              </div>
              <Link
                href={`/${session?.user?.username}`}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors duration-200 ${themeConfig.buttonBg} ${themeConfig.buttonText} ${themeConfig.buttonHover}`}
              >
                <ExternalLink className="h-4 w-4" />
                View Page
              </Link>
            </div>
          </div>

          {/* Links Section */}
          <div className={`rounded-xl border-2 ${themeConfig.buttonBorder} bg-white p-6 shadow-lg`}>
            <h2 className={`mb-6 text-xl font-bold ${themeConfig.buttonText}`}>Your Links</h2>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="links">
                {provided => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {links.map((link, index) => (
                      <Draggable key={link.id} draggableId={link.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm ${
                              snapshot.isDragging ? 'ring-2 ring-black ring-offset-2' : ''
                            }`}
                          >
                            <div {...provided.dragHandleProps} className="cursor-grab">
                              <GripVertical className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex flex-1 flex-col gap-2">
                              <input
                                type="text"
                                value={link.title}
                                onChange={e => updateLink(link.id, 'title', e.target.value)}
                                className="w-full rounded border-none bg-transparent px-2 py-1 text-sm focus:ring-2 focus:ring-black"
                                placeholder="Link Title"
                              />
                              <input
                                type="url"
                                value={link.url}
                                onChange={e => updateLink(link.id, 'url', e.target.value)}
                                className="w-full rounded border-none bg-transparent px-2 py-1 text-sm text-gray-500 focus:ring-2 focus:ring-black"
                                placeholder="https://"
                              />
                            </div>
                            <button
                              onClick={() => deleteLink(link.id)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <label className="relative inline-flex cursor-pointer items-center">
                              <input
                                type="checkbox"
                                checked={link.enabled}
                                className="peer sr-only"
                                onChange={() => updateLink(link.id, 'enabled', !link.enabled)}
                              />
                              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                            </label>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Add Link Button */}
            <button
              onClick={addNewLink}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-black/20 px-4 py-3 text-black/60 transition-colors hover:border-black hover:text-black"
            >
              <Plus className="h-5 w-5" />
              Add Link
            </button>
          </div>
        </main>

        {/* Settings Panel */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div
              className={`absolute right-0 h-full w-96 bg-white p-6 ${themeConfig.buttonBorder}`}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-bold">Settings</h2>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="rounded-lg p-2 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto py-6">
                  {/* User Info */}
                  <div className="mb-6 flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-[#FFCC00]">
                      {session?.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-medium">{session?.user?.name}</div>
                      <div className="text-sm text-gray-500">{session?.user?.email}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 font-medium">Display Name</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={displayName}
                        onChange={e => handleDisplayNameChange(e.target.value)}
                        onBlur={handleDisplayNameSave}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                        placeholder="Your display name"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-medium">Page Metadata</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">Page Title</label>
                        <input
                          type="text"
                          value={pageTitle}
                          onChange={e => setPageTitle(e.target.value)}
                          onBlur={handleMetadataSave}
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                          placeholder="Custom page title (optional)"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Leave blank to use default
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Page Description</label>
                        <textarea
                          value={pageDesc}
                          onChange={e => setPageDesc(e.target.value)}
                          onBlur={handleMetadataSave}
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                          placeholder="Custom page description (optional)"
                          rows={3}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Leave blank to use default
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div>
                      <ThemeSelector
                        currentTheme={currentTheme}
                        onThemeChange={handleThemeChange}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="mb-2 font-medium text-red-600">Danger Zone</h3>
                    <button className="mb-3 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-600 hover:bg-red-100">
                      Delete Account
                    </button>

                    <button
                      onClick={handleSignOut}
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
        )}
        <SaveStatusIndicator />
      </div>
    </>
  );
}
