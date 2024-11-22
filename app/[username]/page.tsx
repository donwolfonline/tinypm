// app/[username]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import LinkButton from '../components/LinkButton';
import EditButton from '../components/EditButton';
import { themes, getThemeStyles } from '@/lib/themes';
import type { Link as LinkType, User } from '@/types';
import { unstable_cache } from 'next/cache';
import { ProxiedImage } from '../components/ProxiedImage';

type PageParams = Promise<{ username: string }>;

export async function generateMetadata(props: { params: PageParams }): Promise<Metadata> {
  const { username } = await props.params;
  const user = await getUser(username);
  return {
    title: user.pageTitle || `${user.name || username} | tiny.pm`,
    description: user.pageDesc || `Check out ${user.name || username}'s links on tiny.pm`,
    openGraph: {
      title: user.pageTitle || `${user.name || username} | tiny.pm`,
      description: user.pageDesc || `Check out ${user.name || username}'s links on tiny.pm`,
    },
    twitter: {
      title: user.pageTitle || `${user.name || username} | tiny.pm`,
      description: user.pageDesc || `Check out ${user.name || username}'s links on tiny.pm`,
    },
  };
}

const getCachedUser = (username: string) =>
  unstable_cache(
    async () => {
      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          links: {
            where: { enabled: true },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              url: true,
              emoji: true,
              enabled: true,
              order: true,
              clicks: true,
              userId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
      return user;
    },
    [`user-${username}`],
    {
      revalidate: 60,
      tags: [`user-${username}`],
    }
  )();

// The function remains the same
async function getUser(username: string): Promise<User> {
  const user = await getCachedUser(username);
  if (!user) notFound();
  return user;
}

// For the page component, we also await the params
export default async function UserPage(props: { params: PageParams }) {
  const { username } = await props.params;
  const user = await getUser(username);
  const userTheme = user.theme || 'YELLOW';
  const themeConfig = themes[userTheme];

  return (
    <div className="min-h-screen p-8" style={getThemeStyles(userTheme)}>
      <EditButton username={username} theme={userTheme} />
      <div className="mx-auto max-w-2xl">
        {/* Profile Header */}
        <div className="mb-8 text-center">
          {user.image ? (
            <ProxiedImage
              src={user.image}
              alt={user.name || ''}
              width={80}
              height={80}
              className="mx-auto mb-4 rounded-full border-2 shadow-lg"
              style={{ borderColor: themeConfig.buttonBg === 'bg-white' ? 'white' : 'black' }}
            />
          ) : (
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 text-xl font-bold shadow-lg ${themeConfig.buttonBg} ${themeConfig.buttonText} ${themeConfig.buttonBorder}`}
            >
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <h1 className={`mb-2 text-2xl font-bold ${themeConfig.text}`}>{user.name}</h1>
        </div>

        {/* Links */}
        <div className="space-y-4">
          {user.links.map((link: LinkType) => (
            <LinkButton
              key={link.id}
              id={link.id}
              href={link.url}
              title={link.title}
              theme={userTheme}
              emoji={link.emoji}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm transition-colors duration-200 ${themeConfig.subtext} hover:${themeConfig.text}`}
          >
            <Image
              src="/images/goose.svg"
              alt="TinyPM"
              width={16}
              height={16}
              className={`${themeConfig.text} opacity-60 transition-opacity duration-200 hover:opacity-100`}
            />
            tiny.pm
          </Link>
        </div>
      </div>
    </div>
  );
}
