// app/dashboard/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Settings } from 'lucide-react';
import debounce from 'lodash/debounce';
import { Theme, Content, Subscription } from '@/types';
import { themes, getThemeStyles } from '@/lib/themes';

// Import our new components
import { PreviewBanner } from '../components/dashboard/PreviewBanner';
import { SettingsPanel } from '../components/dashboard/SettingsPanel';
import { SaveStatusIndicator } from '../components/dashboard/SaveStatusIndicator';
import LoadingSpinner from '../components/LoadingSpinner';
import { ContentItem } from '../components/ContentItems';
import { AddContentMenu } from '../components/AddContentMenu';
import { ThemeColorHandler } from '../components/ThemeColorHandler';

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export default function DashboardPage() {
  const { data: session, update: updateSession, status } = useSession();
  const router = useRouter();

  // State management
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [content, setContent] = useState<Content[]>([]);
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
    debounce(async (contentToSave: Content[]) => {
      try {
        setSaveStatus('saving');
        await Promise.all(
          contentToSave.map(async item => {
            await fetch(`/api/content/${item.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
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
  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content');
      const data = await response.json();
      if (data.content) {
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsTransitioning(false), 1000);
    }
  };

  // Handle link changes
  const handleContentChange = useCallback(
    (newContent: Content[]) => {
      setContent(newContent);
      setSaveStatus('pending');
      unsavedChangesRef.current = true;
      debouncedSaveRef.current(newContent);
    },
    [setSaveStatus]
  );

  // Handle drag and drop
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newContent = Array.from(content);
    const [movedItem] = newContent.splice(result.source.index, 1);
    newContent.splice(result.destination.index, 0, movedItem);

    const updatedContent = newContent.map((item, index) => ({
      ...item,
      order: index,
    }));

    handleContentChange(updatedContent);
  };

  // Handle link operations
  const addNewContent = async (type: 'LINK' | 'TITLE' | 'DIVIDER' | 'TEXT') => {
    try {
      // Prepare content data based on type
      const contentData = {
        type,
        enabled: true,
        order: content.length,
        // Add required fields based on type
        title: type === 'LINK' || type === 'TITLE' ? 'New Title' : null,
        url: type === 'LINK' ? 'https://' : null,
        text: type === 'TEXT' ? 'New Text' : null,
        emoji: type === 'LINK' ? '🔗' : type === 'TITLE' ? '📌' : type === 'TEXT' ? '📝' : '➖',
      };

      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(contentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add content');
      }

      const newContent = await response.json();
      if (newContent.content) {
        handleContentChange([...content, newContent.content]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error adding new content:', error);
      setSaveStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add new content');
    }
  };

  const updateContent = (id: string, field: keyof Content, value: string | boolean | number) => {
    const updatedContent = content.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    handleContentChange(updatedContent);
  };

  const deleteContent = async (id: string) => {
    try {
      await fetch(`/api/content/${id}`, { method: 'DELETE' });
      handleContentChange(content.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting content:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to delete content');
    }
  };

  const handleSessionUpdate = async () => {
    const updated = await updateSession();
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
      fetchContent();
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

      // console.log('Initializing user data:', {
      //   name: session.user.name,
      //   pageTitle: session.user.pageTitle,
      //   pageDesc: session.user.pageDesc,
      //   theme: session.user.theme,
      //   image: session.user.image,
      // });

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

  useEffect(() => {
    async function fetchSubscriptionData() {
      if (!session?.user?.email) return;

      try {
        const response = await fetch('/api/subscription');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSubscription(data.subscription);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        // Consider showing a user-friendly error message
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscriptionData();
  }, [session?.user?.email]); // Only re-run if user email changes

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
      <ThemeColorHandler theme={currentTheme} />
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
        <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
          <PreviewBanner username={session?.user?.username} theme={currentTheme} />

          {/* Content Section */}
          <div className={`mb-4 rounded-xl border-2 ${themeConfig.buttonBorder} bg-white p-6 shadow-lg`}>
            <h2 className={`mb-6 text-xl font-bold ${themeConfig.buttonText}`}>Your Content</h2>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="content">
                {provided => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {content.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <ContentItem
                            content={item}
                            dragHandleProps={provided.dragHandleProps}
                            draggableProps={provided.draggableProps}
                            isDragging={snapshot.isDragging}
                            onUpdate={updateContent}
                            onDelete={deleteContent}
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

            {/* Add Content Menu */}
            <AddContentMenu onAdd={addNewContent} />
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
          subscription={subscription}
        />

        {/* Save Status Indicator */}
        <SaveStatusIndicator status={saveStatus} errorMessage={errorMessage} />
      </div>
    </>
  );
}
