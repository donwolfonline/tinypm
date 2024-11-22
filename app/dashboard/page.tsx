// app/dashboard/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Settings } from 'lucide-react';
import debounce from 'lodash/debounce';
import type { Link as LinkType } from '@/types';
import { Theme } from '@/types';
import { themes, getThemeStyles } from '@/lib/themes';

// Import our new components
import { PreviewBanner } from '../components/dashboard/PreviewBanner';
import { LinkItem } from '../components/dashboard/LinkItem';
import { SettingsPanel } from '../components/dashboard/SettingsPanel';
import { SaveStatusIndicator } from '../components/dashboard/SaveStatusIndicator';
import LoadingSpinner from '../components/LoadingSpinner';

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export default function DashboardPage() {
  const { data: session, update: updateSession, status } = useSession();
  const router = useRouter();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [displayName, setDisplayName] = useState(session?.user?.name || '');
  const [pageTitle, setPageTitle] = useState(session?.user?.pageTitle || '');
  const [pageDesc, setPageDesc] = useState(session?.user?.pageDesc || '');
  const [displayPicture, setDisplayPicture] = useState(session?.user?.image || '');
  const [currentTheme, setCurrentTheme] = useState<Theme>('YELLOW');

  const unsavedChangesRef = useRef<boolean>(false);
  const themeConfig = themes[currentTheme];

  // Create debounced save function
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
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Error saving changes:', error);
        setSaveStatus('error');
        setErrorMessage('Failed to save changes');
      }
    }, 1500)
  );

  // Fetch links from API
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
      setIsLoading(false);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  // Handle link changes
  const handleLinksChange = useCallback(
    (newLinks: LinkType[]) => {
      setLinks(newLinks);
      setSaveStatus('pending');
      unsavedChangesRef.current = true;
      debouncedSaveRef.current(newLinks);
    },
    [setSaveStatus]
  );

  // Handle drag and drop
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newLinks = Array.from(links);
    const [movedItem] = newLinks.splice(result.source.index, 1);
    newLinks.splice(result.destination.index, 0, movedItem);

    const updatedLinks = newLinks.map((link, index) => ({
      ...link,
      order: index,
    }));

    handleLinksChange(updatedLinks);
  };

  // Handle link operations
  const addNewLink = async () => {
    try {
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

      if (!response.ok) throw new Error(`Failed to add link: ${response.statusText}`);

      const newLink = await response.json();
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
      await fetch(`/api/links/${id}`, { method: 'DELETE' });
      handleLinksChange(links.filter(link => link.id !== id));
    } catch (error) {
      console.error('Error deleting link:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to delete link');
    }
  };

  const handleSessionUpdate = async () => {
    const response = await fetch('/api/user');
    const userData = await response.json();
    
    console.log('Latest user data:', userData);

    const updated = await updateSession();
    console.log('Session updated:', updated);
    return updated;
  };

  // Handle sign out
  const handleSignOut = async () => {
    if (unsavedChangesRef.current) {
      await debouncedSaveRef.current.flush();
    }
    await signOut({ callbackUrl: '/' });
  };

  // Effects
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.id) {
      fetchLinks();
    }
  }, [status, session, router]);

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
    const initializeUserData = async () => {
      if (!session?.user) return;

      console.log('Initializing user data:', {
        name: session.user.name,
        pageTitle: session.user.pageTitle,
        pageDesc: session.user.pageDesc,
        theme: session.user.theme,
        image: session.user.image,
      });

      // Set basic user data from session
      setDisplayName(session.user.name || '');
      setPageTitle(session.user.pageTitle || '');
      setPageDesc(session.user.pageDesc || '');
      setDisplayPicture(session.user.image || '');

      // Handle theme
      if (session.user.theme) {
        setCurrentTheme(session.user.theme as Theme);
      } else {
        try {
          const response = await fetch('/api/user');
          const userData = await response.json();
          // console.log('Fetched user data:', userData);
          if (userData.theme) {
            setCurrentTheme(userData.theme as Theme);
          }
          // Also update title and desc if they exist in userData
          if (userData.pageTitle) setPageTitle(userData.pageTitle);
          if (userData.pageDesc) setPageDesc(userData.pageDesc);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    initializeUserData();
  }, [session?.user]);

  // Cleanup
  useEffect(() => {
    const currentDebouncedSave = debouncedSaveRef.current;
    return () => {
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
          style={getThemeStyles(currentTheme, 'solid')}
        >
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
            <div className={`flex items-center gap-2 ${themeConfig.text}`}>
              <Image
                src="/images/goose.svg"
                alt="TinyPM Logo"
                width={64}
                height={64}
                priority={true}
              />
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
          <PreviewBanner username={session?.user?.username} theme={currentTheme} />

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
                          <LinkItem
                            link={link}
                            dragHandleProps={provided.dragHandleProps}
                            draggableProps={provided.draggableProps}
                            isDragging={snapshot.isDragging}
                            onUpdate={updateLink}
                            onDelete={deleteLink}
                            forwardedRef={provided.innerRef}
                          />
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
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          session={session}
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
          displayName={displayName}
          onDisplayNameChange={setDisplayName}
          displayPicture={displayPicture}
          onDisplayPictureChange={setDisplayPicture}
          onSignOut={handleSignOut}
          pageTitle={pageTitle}
          pageDesc={pageDesc}
          onPageTitleChange={setPageTitle}
          onPageDescChange={setPageDesc}
          updateSession={handleSessionUpdate}
          setSaveStatus={setSaveStatus}
          setErrorMessage={setErrorMessage}
        />

        {/* Save Status Indicator */}
        <SaveStatusIndicator status={saveStatus} errorMessage={errorMessage} />
      </div>
    </>
  );
}
