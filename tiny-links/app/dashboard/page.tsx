'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, ExternalLink, Settings, X, LogOut } from 'lucide-react';

interface SocialLink {
  id: string;
  title: string;
  url: string;
  enabled: boolean;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [links, setLinks] = useState<SocialLink[]>([
    { id: '1', title: 'Instagram', url: 'https://instagram.com', enabled: true },
    { id: '2', title: 'Twitter', url: 'https://twitter.com', enabled: true },
  ]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const newLinks = Array.from(links);
    const [movedItem] = newLinks.splice(result.source.index, 1);
    newLinks.splice(result.destination.index, 0, movedItem);

    setLinks(newLinks);
  };

  const addNewLink = () => {
    const newLink = {
      id: `link-${Date.now()}`,
      title: '',
      url: '',
      enabled: true
    };
    setLinks([...links, newLink]);
  };

  const updateLink = (id: string, field: keyof SocialLink, value: string | boolean) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-[#FFCC00]">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-black bg-[#FFCC00]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
          <Image src="/images/goose.svg" alt="TinyPM Logo" width={64} height={64} />
            <span className="text-xl font-bold">tiny.pm</span>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-lg p-2 hover:bg-black/10"
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 pt-24">
        {/* Preview URL Banner */}
        <div className="mb-8 rounded-lg bg-white/80 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🔥 Your page is live at:</span>
              <code className="rounded bg-black/5 px-2 py-1 text-sm">
                tiny.pm/{session?.user?.name}
              </code>
            </div>
            <button className="flex items-center gap-1 rounded-lg bg-black px-3 py-1.5 text-sm text-[#FFCC00]">
              <ExternalLink className="h-4 w-4" />
              View Page
            </button>
          </div>
        </div>

        {/* Links Section */}
        <div className="rounded-xl border-2 border-black bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-bold">Your Links</h2>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="links">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
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
                              onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                              className="w-full rounded border-none bg-transparent px-2 py-1 text-sm focus:ring-2 focus:ring-black"
                              placeholder="Link Title"
                            />
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => updateLink(link.id, 'url', e.target.value)}
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
          <div className="absolute right-0 h-full w-96 bg-white p-6">
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
                  <input
                    type="text"
                    value={session?.user?.name || ''}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="Your display name"
                  />
                </div>
                
                <div>
                  <h3 className="mb-2 font-medium">Theme</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['Default', 'Dark', 'Light'].map((theme) => (
                      <button
                        key={theme}
                        className="rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
                      >
                        {theme}
                      </button>
                    ))}
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
    </div>
  );
}